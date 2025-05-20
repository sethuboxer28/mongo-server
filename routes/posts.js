import express from "express";
const router = express.Router();
import Post from "../models/Post.js";

router.get("/api/posts/", async (req, res) => {
  try {
    const { limit } = req.query;
    const hasInvalidQuery = Object.keys(req.query).some(
      (key) => key !== "limit"
    );

    if (hasInvalidQuery) {
      return res
        .status(400)
        .json({ message: "Invalid query parameter/ give query as limit" });
    }

    if (!limit) {
      const allPosts = await Post.find();
      return res.status(200).json(allPosts);
    }

    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(404).json({
        message: "query limit should be a number and it should be more than 0",
      });
    }

    const totalPosts = await Post.countDocuments();

    if (parsedLimit > totalPosts) {
      return res
        .status(404)
        .json({ message: `There are only ${totalPosts} posts` });
    }

    const limitedPosts = await Post.find().limit(parsedLimit);
    return res.status(200).json(limitedPosts);
  } catch (error) {
    res.status(500).json({ message: `Error fetching posts ${error}` });
  }
});

router.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.status(200).json(post);
    } else {
      res
        .status(404)
        .json({ message: `Post with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error feching posts, ${error}` });
  }
});

router.delete("/api/posts/:id", async (req, res) => {
  const deletedPost = await Post.findByIdAndDelete(req.params.id);

  if (deletedPost) {
    res.status(200).json({ message: `Post with id ${req.params.id} deleted` });
  } else {
    res
      .status(404)
      .json({ message: `Post with ID ${req.params.id} not found` });
  }
});

router.put("/api/posts/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (updatedPost) {
      res.status(200).json(updatedPost);
    } else {
      res.status(404).json({
        message: `Post with ID ${req.params.id} not found`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: `Error feching posts, ${error}` });
  }
});

router.post("/api/posts/", async (req, res) => {
  const newPost = new Post({
    course: req.body.course,
    description: req.body.description,
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: `Error creating new post: ${error}` });
  }
});

export default router;
