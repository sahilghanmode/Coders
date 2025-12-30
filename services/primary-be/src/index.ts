import express from "express";
import fs from "fs";
import path from "path";

const app = express();

app.use(express.json());

app.get("/get-problem", async (req, res) => {
  const data = await fs.readFileSync(
    "d:/web-dev/Projects/Coders/services/problems/1/problem.md",
    "utf8"
  );
  console.log(data);
  res.send(data);
});

app.post("/test", async (req, res) => {
  try {
    const userCode = req.body.userCode;
    const problemId = req.body.problemId;
    const language = req.body.language;

    const langExtension =
      language == "cpp" ? "cpp" : language == "python" ? "py" : "js";

    if (!languageMap.includes(langExtension)) {
      return res.status(400).json({ error: "language not supported" });
    }

    const boilerplate = await fs.readFileSync(
      `D:/web-dev/Projects/Coders/services/problems/${problemId}/boilerplate_full/function.${langExtension}`,
      "utf8"
    );
    const finalCode = boilerplate.replace("**Your Code Goes Here**", userCode);

    // Read test cases
    const testsInputDir = path.join(
      "D:/web-dev/Projects/Coders/services/problems",
      problemId,
      "tests/inputs"
    );

    const testsOutputDir = path.join(
      "D:/web-dev/Projects/Coders/services/problems",
      problemId,
      "tests/outputs"
    );

    const inputFiles = fs.readdirSync(testsInputDir);
    const testCaseFiles = inputFiles
      .filter((file) => file.endsWith(".txt"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
      });

    console.log(`Found ${testCaseFiles.length} test cases:`, testCaseFiles);

    const testCases = testCaseFiles.map((file) => {
      const inputPath = path.join(testsInputDir, file);
      const outputPath = path.join(testsOutputDir, file);

      const inputData = fs.readFileSync(inputPath, "utf8");
      const expectedOutput = fs.readFileSync(outputPath, "utf8");

      return {
        input: inputData.trim(),
        expectedOutput: expectedOutput.trim(),
      };
    });

    const submissions = testCases.map((testCase) => ({
      source_code: finalCode,
      language_id: getJudge0LanguageId(language),
      stdin: testCase.input,
      expected_output: testCase.expectedOutput,
    }));

    console.log(submissions)
    // console.log(`Submitting ${submissions.length} test cases...`);

    const batchResponse = await fetch(
      "http://localhost:2358/submissions/batch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissions: submissions,
        }),
      }
    );

    console.log("Batch response status:", batchResponse.status);

    if (!batchResponse.ok) {
      const errorText = await batchResponse.text();
      console.error("Judge0 error:", errorText);
      return res.status(batchResponse.status).json({
        error: "Judge0 submission failed",
        details: errorText,
      });
    }

    const batchData = await batchResponse.json();
    console.log("Batch submitted successfully:", batchData);

    const tokens = batchData.map((item: any) => item.token).join(",");

    let results: any;
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const resultResponse = await fetch(
        `http://localhost:2358/submissions/batch?tokens=${tokens}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      results = await resultResponse.json();

      const allProcessed = results.submissions.every(
        (r: any) => r.status.id > 2
      );

      if (allProcessed) {
        console.log("All test cases processed");
        break;
      }

      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}`);
    }

    const formattedResults = results.submissions.map(
      (result: any, index: number) => ({
        testCase: index + 1,
        status: result.status.description,
        statusId: result.status.id,
        passed: result.status.id === 3,
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        time: result.time,
        memory: result.memory,
        input: testCases[index].input,
        expectedOutput: testCases[index].expectedOutput,
      })
    );

    console.log(formattedResults);

    const passedCount = formattedResults.filter((r: any) => r.passed).length;
    const totalCount = formattedResults.length;

    res.json({
      success: true,
      summary: {
        passed: passedCount,
        total: totalCount,
        allPassed: passedCount === totalCount,
        percentage: ((passedCount / totalCount) * 100).toFixed(2),
      },
      results: formattedResults,
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

function getJudge0LanguageId(language: string): number {
  const languageIds: { [key: string]: number } = {
    cpp: 54,
    python: 71,
    javascript: 63,
  };
  return languageIds[language] || 63;
}

const languageMap: string[] = ["cpp", "py", "js"];

app.listen(3000, () => {
  console.log("listening on port 3000");
});