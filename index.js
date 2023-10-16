// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;

// Define our connection string. Info on where to get this will be described below. In a real world application you'd want to get this string from a key vault like AWS Key Management, but for brevity, we'll hardcode it in our serverless function here.
const MONGODB_URI =
  "mongodb+srv://m001-student:Filipe89@sandbox.t1kvz.mongodb.net/?retryWrites=true&w=majority";

// Once we connect to the database once, we'll store that connection and reuse it so that we don't have to connect to the database on every request.
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(MONGODB_URI);

  // Specify which database we want to use
  const db = await client.db("sample_mflix");

  cachedDb = db;
  return db;
}



exports.handler = async (event, context) => {

  /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
  context.callbackWaitsForEmptyEventLoop = false;

  // Get an instance of our database
  const db = await connectToDatabase();

  console.log(event);

  if( event.input.path === "/mgsense/customers" && event.input.httpMethod === "POST") {
    return await customerCreate();
  } else if( event.input.path === "/mgsense/providers" && event.input.httpMethod === "POST") {
    return await providerCreate();
  }


  return {
            statusCode: 200,
            body: JSON.stringify("Missing"),
        };;
};

const customerCreate = async ( customer ) => {
    let res = await db.collection("customers").find({email: customer.email}).limit(1).toArray();
    let response;
    if(res){
        response = {
            statusCode: 401,
            body: JSON.stringify({code: 401210}),
        };
    } else {
        res = await db.collection("customers").insert(customer);
        response = {
            statusCode: 200,
            body: JSON.stringify(res),
        };
    }
    return response;
}

const providerCreate = async ( provider ) => {
    let res = await db.collection("providers").find({email: provider.email}).limit(1).toArray();
    let response;
    if(res){
        response = {
            statusCode: 401,
            body: JSON.stringify({code: 401210}),
          };
    } else {
        res = await db.collection("providers").insert(provider);
        response = {
            statusCode: 200,
            body: JSON.stringify(res),
        };
    }
    
}