const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
// middleware

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6rjuyq3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();

    const database1 = client.db("RoomsDB");
    const Roomcollections = database1.collection("Rooms");
    const database2 = client.db("MyBookingDB");
    const Bookingcollections = database2.collection("MyBookings");
  

    app.get('/rooms', async (req, res) => {
      const cursor = Roomcollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/rooms/:id' , async(req , res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const room = await Roomcollections.findOne(query);
      res.send(room)

    })

    //my booking
    app.get('/mybookings', async (req, res) => {
      const cursor = Bookingcollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/mybookings', async (req, res) => {
      const mybookings = req.body;
      const result = await Bookingcollections.insertOne(mybookings);
      res.send(result)
    })



    

    

   
   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Brand Shop management server is running')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})

// user
// borshonsaha1234
// password
// TLqQE4ymjG3zYyQT