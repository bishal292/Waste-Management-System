import { Report } from "../db/Schemas";


export const createReport = async (req,res) => { 
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send("You are not Authenticated.");            
        }
        if(!req.body.report) return res.status(400).send("Report is required");

        const {location, wasteType, amount, imageUrl, collectorId } = req.body.report;

        if(!location || !wasteType || !amount) return res.status(400).send("All fields are required");
        const newReport = await Report.create({
            userId,
            location,
            wasteType,
            amount,
            imageUrl,
            collectorId
        })
        res.status(201).json(newReport);
    } catch (error) {
        
    }
}

export const getReports = async (req,res) => {

}