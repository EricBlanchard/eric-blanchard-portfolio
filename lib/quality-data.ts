import raw from "@/generated/quality.json";
import { parseQuality, type QualityReport } from "./quality";

/** The report produced by the pipeline run that built this deployment. */
export const quality: QualityReport = parseQuality(raw);
