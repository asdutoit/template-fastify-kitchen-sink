import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
import axios from "axios";
import { getPlaiceholder } from "plaiceholder";

const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");

export default async function (fastify, options) {
  fastify.post(
    "/addListing",
    {
      preValidation: [fastify.authenticate],
      preHandler: fastify.upload.array("photos"),
    },
    async function (request, reply) {
      const rejectedFiles = [];
      const allFiles = [];
      const files = request.files;
      const body = request.body;
      for await (const file of files) {
        const uploadUrl = `${process.env.BUNNYCDN_STORAGE_LOCATION}${process.env.BUNNYCDN_STORAGE_ZONE_NAME}/${file.filename}`;
        const imageData = {};
        if (file.size > 1024 * 1024 * 5) {
          rejectedFiles.push(file.originalname);
          fs.unlinkSync(`${uploadDir}/${file.filename}`);
          fastify.log.error({
            Message: "File upload error.  File size exceeds 5MB",
            Data: file.originalname,
          });
        } else {
          const readfile = fs.readFileSync(`${uploadDir}/${file.filename}`);

          const { base64 } = await getPlaiceholder(readfile);
          imageData.base64 = base64;

          // Upload file to Bunny.net CDN
          const response = await axios.put(uploadUrl, readfile, {
            headers: {
              "Content-Type": "application/octet-stream",
              AccessKey: process.env.BUNNYCDN_API_KEY,
            },
          });

          imageData.imagePath = uploadUrl;
          imageData.imageFileName = file.filename;
          imageData.imageName = file.filename.split(".")[0];
          imageData.imageExtension = file.filename.split(".")[1];
          imageData.href = `${process.env.BUNNYCDN_HOMERUNNER_CDN}/${file.filename}`;
          allFiles.push(imageData);

          try {
            await fastify.prisma.photos.create({
              data: imageData,
            });
          } catch (error) {
            console.log("DB Error: ", error);
          }

          // Delete the file from the server
          if (response.status === 201) {
            fs.unlinkSync(`${uploadDir}/${file.filename}`);
          }
        }
      }

      reply.status(201).send({
        acceptedFiles: {
          message: "The following files have been uploaded successfully",
          files: allFiles,
        },
        rejectedFiles: {
          message: "Files upload error.  Files size exceeds 5MB",
          files: rejectedFiles,
        },
      });
    }
  );
}
