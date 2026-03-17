import express from "express";

const router = express.Router();

// temporary in-memory storage (replace with MongoDB later)
let requests = [];

// CREATE INTERVIEW REQUEST
router.post("/request", (req, res) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }

    const newRequest = {
      id: Date.now().toString(),
      candidateId,
      status: "pending",
      createdAt: new Date(),
    };

    requests.push(newRequest);

    console.log("Interview request created:", newRequest);
    res.json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CANDIDATE REQUESTS
router.get("/my-requests", (req, res) => {
  try {
    const { candidateId } = req.query;

    if (!candidateId) {
      return res.status(400).json({ error: "candidateId query parameter is required" });
    }

    const myRequests = requests.filter((r) => r.candidateId === candidateId);

    console.log(`Fetched ${myRequests.length} requests for candidate ${candidateId}`);
    res.json(myRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
