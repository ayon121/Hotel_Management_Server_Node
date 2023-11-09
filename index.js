const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
// token 
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser')
app.use(express.json())
app.use(cookieparser())
app.use(cors({
  origin : [
    // 'http://localhost:5173',
    'https://hotel-management-beb7b.web.app',
    'https://hotel-management-beb7b.firebaseapp.com/',
  ],
  credentials : true
}))

const verifytoken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log('verified' + token);
  if (!token) {
    return res.status(401).send({ message: 'forbidden' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // error
    if (err) {
      console.log(err);
      return res.status(401).send({ message: 'forbidden' })
    }
    // if token is valid then it would be decoded
    console.log('value in the token', decoded);
    req.user = decoded
    next()
  })

}


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

    // await client.connect();

    const database1 = client.db("RoomsDB");
    const Roomcollections = database1.collection("Rooms");
    const database2 = client.db("MyBookDB");
    const Bookingcollections = database2.collection("MyBook");
    const database3 = client.db("ReviewssDB");
    const Reviewcollections = database3.collection("MyReviewss");





    // auth related 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {expiresIn : '1h'})

      res
      .cookie('token',token , {
        httpOnly : true,
        secure : true,   //set secure false for development purpose
        
        sameSite : 'none',

      })

      .send({success : true})
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('deleted', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })


    app.get('/rooms', async (req, res) => {
      const cursor = Roomcollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })
 
    app.get('/rooms/:id',  async (req, res) => {
      // if (req.query.email == req.user.email) {
      //   return res.status(403).send({ message: 'forbidden' })

      // }
      
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) }
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



    app.get('/mybookings/:id',verifytoken, async (req, res) => {
      if(req.params?.id !== req.user.email){
        return res.status(403).send({message : 'forbidden'})
        
    }

      

      const id = req.params?.id;
      console.log(id);

      const query = { useremail: id };
      const bookings = await Bookingcollections.find(query).toArray();
      res.send(bookings)

    })

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { id: id };
      const Review = await Reviewcollections.find(query).toArray();
      res.send(Review)

    })
    app.get('/reviews', async (req, res) => {
      const cursor = Reviewcollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/reviews', async (req, res) => {
      const Review = req.body;
      const result = await Reviewcollections.insertOne(Review);
      res.send(result)

    })

    app.delete('/mybooking/:id', async (req, res) => {
      const id = req.params.id
      console.log('plz delete  from database', id);
      const query = { _id: new ObjectId(id) }
      const result = await Bookingcollections.deleteOne(query)
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