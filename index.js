require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;

// Middleware

app.use(
  cors({
    origin: "http://localhost:5173", // Remove trailing slash
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

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

    // Auth related APIs

    // Create JWT Token
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.JWT_TOKEN_SECRET, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    // Remove JWT Toke
    app.post("/removeJwt", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    // Verify Token Api
    const verifyToken = (req, res, next) => {
      const token = req.cookies.token;

      if (!token) {
        return res.send("Unauthorized user");
      }

      next();
    };

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
      const { likeCount, userId } = req.body;

      try {
        // Validate userId and likeCount
        if (!userId || typeof likeCount !== "number") {
          return res.status(400).json({
            message: "Invalid input: likeCount are required",
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

    // Get my Artifacts
    app.get("/my-artifacts", async (req, res) => {
      const email = req.query.email;
      const query = { "artifactAdder.email": email };
      const result = await artifactsData.find(query).toArray();

      res.send(result);
    });

    // Update My Artifacts
    app.put("/update-artifact/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const {
        artifactName,
        artifactType,
        artifactImage,
        createdAt,
        discoveredAt,
        discoveredBy,
        presentLocation,
        historicalContext,
      } = req.body;

      const updateDoc = {
        $set: {
          artifactName: artifactName,
          artifactType: artifactType,
          artifactImage: artifactImage,
          createdAt: createdAt,
          discoveredAt: discoveredAt,
          discoveredBy: discoveredBy,
          presentLocation: presentLocation,
          historicalContext: historicalContext,
        },
      };

      const result = await artifactsData.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete My artifacts
    app.delete("/delete-artifact/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await artifactsData.deleteOne(filter);
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
