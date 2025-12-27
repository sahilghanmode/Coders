import express from "express";
import fs from "fs";

const app=express();

app.use(express.json());

app.get("/get-problem",async(req,res)=>{  
    
    
    const data=await fs.readFileSync("d:/web-dev/Projects/Coders/services/problems/1/problem.md","utf8")
    console.log(data);
    res.send(data)
}) 



app.listen(3000,()=>{
    console.log("listening  on port 3000")
})