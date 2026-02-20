import { db } from "../src/lib/db";
import { importContent } from "../src/lib/importer";

async function main() {
  const importResult = await importContent();

  await db.examProfile.upsert({
    where: {
      code: "REGITRA_SIM_V1",
    },
    update: {
      label: "Regitra simuliacija",
      timeLimitSec: 1800,
      questionCount: 15,
      passThresholdPct: null,
      evidenceStatus: "INSUFFICIENT_RULE_BASIS",
      note: "Oficialus teorijos vertinimo slenkstis nepateiktas pateiktoje medzagoje.",
    },
    create: {
      code: "REGITRA_SIM_V1",
      label: "Regitra simuliacija",
      timeLimitSec: 1800,
      questionCount: 15,
      passThresholdPct: null,
      evidenceStatus: "INSUFFICIENT_RULE_BASIS",
      note: "Oficialus teorijos vertinimo slenkstis nepateiktas pateiktoje medzagoje.",
    },
  });

  console.log("Import result:", importResult);
  console.log("Exam profile ready: REGITRA_SIM_V1");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
