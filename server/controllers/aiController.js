import OpenAI from "openai";
import sql from "../configs/db.js";
import { v2 as cloudinary } from "cloudinary";
import axios from 'axios';
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js"

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: length
        });

        const content = response.choices[0].message.content;

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${'article'})`;

        res.json({ success: true, content });
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100
        });

        const content = response.choices[0].message.content;

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${'blog-title'})`;

        res.json({ success: true, content });
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;

        const formData = new FormData();
        formData.append('prompt', prompt);
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer"
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, ${'image'}, ${publish ?? false})`;

        res.json({ success: true, content: secure_url });
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;

    if (!image) {
      return res.json({ success: false, message: "No image uploaded." });
    }

    const uploadResponse = await cloudinary.uploader.upload_stream(
      {
        transformation: [
          {
            effect: "background_removal",
            background_removal: "remove_the_background",
          },
        ],
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.json({ success: false, message: error.message });
        }

        const secure_url = result.secure_url;

        await sql`
          INSERT INTO creations (user_id, prompt, content, type)
          VALUES (${userId}, ${"Remove background from image"}, ${secure_url}, ${"image"})
        `;
        res.json({ success: true, content: secure_url });
      }
    );
    const streamifier = await import("streamifier");
    streamifier.default.createReadStream(image.buffer).pipe(uploadResponse);
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
}

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await uploadToCloudinary(image.buffer);

    const imageUrl = cloudinary.url(result.public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image"
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, ${'image'})`;

    res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error("RemoveImageObject Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;

        if(resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file exceeds allowed size (5MB)." })
        }
        const pdfData = await pdf(resume.buffer);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content: \n\n${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content;

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, ${'resume-review'})`;

        res.json({ success: true, content });
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

