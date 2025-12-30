import fs from 'fs';
import path from 'path';
import { DefinitionParser } from './DefinitionParser';
import { FullDefinitionParser } from './FullDefinitionParser';
   
function partialBoilerPlateGenerator(generatorFilePath:string){
    const inputFilePath=path.join(__dirname,generatorFilePath,"structure.md");

    const boilerplatePath=path.join(__dirname,generatorFilePath,"boilerplate");

    const inputpath=fs.readFileSync(inputFilePath,'utf-8');

    const parser=new DefinitionParser();

    parser.parse(inputpath);

    const cppCode=parser.generateCppBoilerplate();
    // const javaCode=parser.generateJavaBoilerplate();
    // const javaTestCode=parser.generateJavaTestBoilerplate();
    const javascriptCode=parser.generateJavaScriptBoilerplate();
    const pythonCode=parser.generatePythonBoilerplate();
    
    if(!fs.existsSync(boilerplatePath)){
        fs.mkdirSync(boilerplatePath);
    }

    fs.writeFileSync(path.join(boilerplatePath,'function.cpp'),cppCode);
    // fs.writeFileSync(path.join(boilerplatePath,'function.java'),javaCode);
    fs.writeFileSync(path.join(boilerplatePath,'function.py'),pythonCode);
    fs.writeFileSync(path.join(boilerplatePath,'function.js'),javascriptCode);
}

function fullBoilerPlateGenerator(generatorFilePath:string){
    const inputFilePath=path.join(__dirname,generatorFilePath,"structure.md");
    
    const fullboilerplatePath=path.join(__dirname,generatorFilePath,"boilerplate_full");

    const inputpath=fs.readFileSync(inputFilePath,'utf-8');

    const parser=new FullDefinitionParser();
    parser.parse(inputpath);

    const cppCode=parser.generateCppFullBoilerplate()
    const pythonCode=parser.generatePythonFullBoilerplate();
    const javascriptCode=parser.generateJavaScriptFullBoilerplate();

    if(!fs.existsSync(fullboilerplatePath)){
        fs.mkdirSync(fullboilerplatePath);
    }

    fs.writeFileSync(path.join(fullboilerplatePath,'function.cpp'),cppCode);
    fs.writeFileSync(path.join(fullboilerplatePath,'function.py'),pythonCode);
    fs.writeFileSync(path.join(fullboilerplatePath,'function.js'),javascriptCode);



    // console.log(inputpath)
}

partialBoilerPlateGenerator('../../problems/1');

fullBoilerPlateGenerator('../../problems/1');