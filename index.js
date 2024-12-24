require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 50000;

// Middleware
app.use(express.json());
app.use(cors());

// Mongo DB Code

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.t47d6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Connect to the "LegacyLibrary" database and access its "artifactsData" collection
    const LegacyLibrary = client.db("LegacyLibrary");
    const artifactsData = LegacyLibrary.collection("artifactsData");

    // add artifacts data to mongodb
    app.post("/addArtifacts", async (req, res) => {
      const artifacts = req.body;
      console.log(artifacts);
      const result = await artifactsData.insertOne(artifacts);
      res.send(result);
    });

    // Get All Artifacts data from mongodb
    app.get("/artifactsData", async (req, res) => {
      const result = await artifactsData.find().toArray();
      res.send(result);
    });

    // Handle Like and dislike
    app.put("/updateLike/:id", async (req, res) => {
      const { id } = req.params;
      const { userId, likeCount } = req.body;

      try {
        // Validate userId and likeCount
        if (!userId || typeof likeCount !== "number") {
          return res.status(400).json({
            message: "Invalid input: userId and likeCount are required",
          });
        }

        const objectId = new ObjectId(id);

        // Find the artifact by ID
        const artifact = await artifactsData.findOne({ _id: objectId });
        if (!artifact) {
          return res.status(404).json({ message: "Artifact not found" });
        }

        const updateOperation = artifact.likedBy.includes(userId)
          ? {
              $pull: { likedBy: userId },
              $set: { likeCount },
            }
          : {
              $addToSet: { likedBy: userId },
              $set: { likeCount },
            };

        // Perform the update
        const result = await artifactsData.updateOne(
          { _id: objectId },
          updateOperation
        );

        if (result.modifiedCount === 0) {
          return res
            .status(500)
            .json({ message: "Failed to update like count" });
        }

        return res.send("Operation Successful");
      } catch (error) {
        console.error(error);
        return res.status(500).send("Operation Failed");
      }
    });

    // Get Specific Artifacts data from mongodb
    app.get(`/artifactsData/:id`, async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const result = await artifactsData.findOne(find);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Default Code
app.get("/", (req, res) => {
  res.send(`Assignment 11 server is running on port ${port}`);
});
app.listen(port, () => {
  console.log("Server is running");
});
