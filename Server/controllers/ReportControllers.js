import { Report } from "../db/Schemas.js";


export const createReport = async (req,res) => { 
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send("You are not Authenticated.");            
        }
        if(!req.body.report) return res.status(400).send("Report is required");

        const {location, type, amount, imageUrl , verificationResult } = req.body.report;
        if(!location || !type || !amount || !verificationResult) return res.status(400).send("All fields are required");
        const newReport = await Report.create({
            userId,
            location,
            wasteType:type,
            amount,
            imageUrl,
            verificationResult
        })
        res.status(201).json(newReport);
    } catch (error) {
        res.status(500).send("Internal Server Error");
        console.log("Some Error Occured", error);
    }
}

export const getReports = async (req,res) => {

}