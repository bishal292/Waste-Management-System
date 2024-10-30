import { Report } from "../db/Schemas.js";


export const getRewards = async (req, res) => {

}
// to respond all the reports reported by the user.
export const getReports = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send("You are not Authenticated.");            
        }
        const {skip, limit } = req.query;
        if(skip && limit){
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

export const getTransactions = async (req, res) => {

}