import fs from "fs";

import {
  initGmssl,
  generateSm2KeyPair,
  calculateSm3Hash,
  signWithSm2,
  verifyWithSm2,
} from "./gmssl-wrapper";

import { PerformanceCounter } from "./performance";

async function runBenchmark() {
  console.log("\n");
  console.log("========================================");
  console.log("SM2 / SM3 Performance Benchmark");
  console.log("========================================");
  console.log("\n");

  await initGmssl();

  const TEST_COUNT = 1000;

  const keyGenCounter =
    new PerformanceCounter();

  const hashCounter =
    new PerformanceCounter();

  const signCounter =
    new PerformanceCounter();

  const verifyCounter =
    new PerformanceCounter();

  const csvData = [
    "index,keygen,hash,sign,verify",
  ];

  for (let i = 0; i < TEST_COUNT; i++) {
    const message =
      `Benchmark_Message_${i}`;

    // ==================
    // KeyGen
    // ==================
    let start = performance.now();

    const keyPair =
      await generateSm2KeyPair();

    let end = performance.now();

    const keyGenTime =
      end - start;

    keyGenCounter.add(
      keyGenTime
    );

    // ==================
    // SM3
    // ==================
    start = performance.now();

    const hash =
      await calculateSm3Hash(
        message
      );

    end = performance.now();

    const hashTime =
      end - start;

    hashCounter.add(
      hashTime
    );

    // ==================
    // Sign
    // ==================
    start = performance.now();

    const signature =
      await signWithSm2(
        hash,
        keyPair.privateKey,
        "benchmark"
      );

    end = performance.now();

    const signTime =
      end - start;

    signCounter.add(
      signTime
    );

    // ==================
    // Verify
    // ==================
    start = performance.now();

    await verifyWithSm2(
      hash,
      signature,
      keyPair.publicKey
    );

    end = performance.now();

    const verifyTime =
      end - start;

    verifyCounter.add(
      verifyTime
    );

    csvData.push(
      `${i},${keyGenTime},${hashTime},${signTime},${verifyTime}`
    );
  }

  keyGenCounter.print(
    "SM2 Key Generation"
  );

  hashCounter.print(
    "SM3 Hash"
  );

  signCounter.print(
    "SM2 Signature"
  );

  verifyCounter.print(
    "SM2 Verification"
  );

  const signTPS =
    1000 / signCounter.average;

  const verifyTPS =
    1000 / verifyCounter.average;

  console.log("\n");

  console.log(
    `SM2 Sign TPS : ${signTPS.toFixed(2)}`
  );

  console.log(
    `SM2 Verify TPS : ${verifyTPS.toFixed(2)}`
  );

  fs.writeFileSync(
    "benchmark.csv",
    csvData.join("\n")
  );

  console.log(
    "\nbenchmark.csv 已生成"
  );
}

runBenchmark()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
