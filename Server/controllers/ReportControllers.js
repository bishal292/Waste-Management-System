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

export const getRecentReports = async (req,res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send("You are not Authenticated.");            
        }
        const {skip, limit } = req.query;
        if(skip || limit){
            const reports = await Report.find({userId}).sort({createdAt:-1}).skip(skip).limit(limit).select('amount createdAt _id location wasteType');
            res.status(200).json(reports);
        }else{
            const reports = await Report.find({userId}).sort({createdAt:-1}).select('amount createdAt _id location wasteType');
            res.status(200).json(reports);
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
        console.log("Some Error Occured", error);
    }
}