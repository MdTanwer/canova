import { Router } from "express";
import { ConditionController } from "../controllesr/formBuilderConditionController";

const conditionRouter = Router();

// Create condition
conditionRouter.post("/", ConditionController.createCondition);

// Get conditions by form and page
// conditionRouter.get("/:formId/:pageId", ConditionController.getConditions);

// // Update condition
// conditionRouter.put("/:conditionId", ConditionController.updateCondition);

// // Delete condition
// conditionRouter.delete("/:conditionId", ConditionController.deleteCondition);

// // Evaluate conditions and get next page
conditionRouter.post("/evaluate", ConditionController.evaluateConditions);
conditionRouter.post("/page-flow", ConditionController.getSequencesForPage);

export { conditionRouter };
