import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  potential_roadmaps: [
    {
      career_title: {
        type: String,
        required: true,
        trim: true,
      },
      existing_skills: [
        {
          type: String,
          trim: true,
        },
      ],
      match_score: {
        type: Number,
        min: 0,
        max: 1,
      },
      sequenced_roadmap: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  ],
});

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
