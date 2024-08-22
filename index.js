const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin:['http://localhost:5173'
    ,'https://group-study-d6cf6.web.app','https://group-study-d6cf6.firebaseapp.com'
  ],
      credentials:true,
      optionsSuccessStatus:200 ,
})
);
app.use(express.json());

//groupStudy
//7vwElB6pl9dVjWmz


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y8iiotm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



const logger = (req,res,next) =>{
  console.log(req.method, req.url)
  next()
}



const cookeOption ={
  httpOnly:true,
  secure:process.env.NODE_ENV === "production" ? "none" : "strict",
  sameSite:process.env.NODE_ENV === "production" ? true : false,
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const assignmentCollection = client.db('studyDB').collection('study')
    const submitedCollection = client.db("studyDB").collection("submit")





    app.post('/jwt',logger,async(req,res)=>{
      const user = req.body;
      console.log('user' , user)
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res.cookie('token',token,cookeOption)
      .send({success:true})
    })





    app.post('/jwt', async (req, res) => {
      try {
          const user = req.body
          const token = jwt.sign(user, jwtSecret, {
              expiresIn: '1d',
          })
          res
              .cookie('token', token, {
                  httpOnly: true,
                  secure: process.env.ACCESS_TOKEN_SECRET === 'production',
                  sameSite: process.env.ACCESS_TOKEN_SECRET === 'production' ? 'none' : 'strict',
              })
              .send({
                  status: true,
              })
      } catch (error) {
          res.send({
              status: true,
              error: error.message,
          })
      }
  })
  


    app.post('/logOut',async(req,res)=>{
      const user = req.body;
      console.log(user)
      res.clearCookie('token',{...cookeOption,maxAge:0}).send({success:true})
    })
  




    app.get('/study',async(req,res)=>{
        const cursor = assignmentCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/study/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await assignmentCollection.findOne(query);
        res.send(result);
    })

    app.put(`/study/:id`,async(req,res) =>{
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)}
        const options = {upsert:true};
        const updatedStudy = req.body;
        const update = {
            $set:{
                 title:updatedStudy.title,
                 marks:updatedStudy.marks,
                 date:updatedStudy.date,
                 assignment:updatedStudy.assignment,
                 photo:updatedStudy.photo,
                 pdf:updatedStudy.pdf,
                 description:updatedStudy.description
            }
        }
        const result = await assignmentCollection.updateOne(filter,update,options);
        res.send(result)
    })

    app.post('/submited',async(req,res) =>{
      const submit = req.body;
      console.log('submit ' , submit)
      const submitResult = await submitedCollection.insertOne(submit)
      res.send(submitResult)
    })

    app.get('/submited',async(req,res)=>{
      const result = await submitedCollection.find().toArray();
      //console.log(result)
      res.send(result);
    })

    app.put(`/submited/:id`,async(req,res) =>{
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)}
      const options = {upsert:true};
      const updatedStudy = req.body;
      const update = {
          $set:{
               title:updatedStudy.title,
               marks:updatedStudy.marks,
               date:updatedStudy.date,
               assignment:updatedStudy.assignment,
               photo:updatedStudy.photo,
               pdf:updatedStudy.pdf,
               description:updatedStudy.description,
               status:updatedStudy.status
          }
      }
      const result = await submitedCollection.updateOne(filter,update,options);
      res.send(result)
  })


  app.get('/submited/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await submitedCollection.findOne(query);
    res.send(result);
})


    app.post('/study',async(req,res)=>{
        const newAssignment = req.body;
        console.log(newAssignment)
        const result = await assignmentCollection.insertOne(newAssignment)
        res.send(result)
    })

    app.delete('/study/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}
        const result = await assignmentCollection.deleteOne(query);
        res.send(result)
    })



    // Send a ping to confirm a successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);





app.get('/',(req,res) =>{
    res.send('study running nowwwwwwwwwww')
})
app.listen(port,() =>{
    console.log(`study server running now: ${port}`)
})