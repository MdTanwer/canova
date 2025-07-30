// ===== CONDITION CONTROLLER =====
import { Request, Response } from "express";
import { Answer, Question } from "../models/Question";
import { Condition } from "../models/condition";
import { Page } from "../models/Page";

export class ConditionController {
  // Get all multiple-choice questions for a form/page
  static async getMultipleChoiceQuestions(req: Request, res: Response) {
    try {
      const { formId, pageId } = req.params;

      // Filter only multiple-choice questions
      const multipleChoiceQuestions = await Question.find({
        formId,
        pageId,
        type: "multiple-choice",
      }).select("_id question options order");

      if (multipleChoiceQuestions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No multiple-choice questions found for this page",
        });
      }

      res.status(200).json({
        success: true,
        message: "Multiple-choice questions retrieved successfully",
        data: multipleChoiceQuestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching multiple-choice questions",
        error,
      });
    }
  }
  // Create a new condition (Admin sets condition)
  static async createCondition(req: Request, res: Response) {
    try {
      const {
        formId,
        pageId,
        rules, // Array of {questionId, adminAnswer}
        sourcePage,
        destinationPage,
        logicOperator = "AND",
      } = req.body;

      // Validate rules array
      if (!rules || !Array.isArray(rules) || rules.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rules array is required and must contain at least one rule",
        });
      }

      // Get all multiple-choice questions for this form/page
      const multipleChoiceQuestions = await Question.find({
        formId,
        pageId,
        type: "multiple-choice",
      });

      if (multipleChoiceQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No multiple-choice questions found for this page",
        });
      }

      // Extract question IDs from rules
      const questionIds = rules.map((rule) => rule.questionId);

      // Validate each rule
      const validatedRules = [];
      for (const rule of rules) {
        const { questionId, adminAnswer } = rule;

        // Find the question in multiple-choice questions
        const selectedQuestion = multipleChoiceQuestions.find(
          (q) => q._id.toString() === questionId
        );

        if (!selectedQuestion) {
          return res.status(400).json({
            success: false,
            message: `Question ${questionId} is not a multiple-choice question or doesn't exist on this page`,
            availableQuestions: multipleChoiceQuestions.map((q) => ({
              id: q._id,
              question: q.question,
              options: q.options,
            })),
          });
        }

        // Check if admin answer exists in question options
        if (!selectedQuestion.options?.includes(adminAnswer)) {
          return res.status(400).json({
            success: false,
            message: `Admin answer "${adminAnswer}" is not valid for question "${selectedQuestion.question}"`,
            availableOptions: selectedQuestion.options,
            questionId: selectedQuestion._id,
          });
        }

        validatedRules.push({
          questionId: selectedQuestion._id,
          adminAnswer,
        });
      }

      // Check for duplicate rules (same question appears twice)
      const uniqueQuestionIds = new Set(questionIds.map((id) => id.toString()));
      if (uniqueQuestionIds.size !== questionIds.length) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate questions found in rules. Each question can only appear once per condition",
        });
      }

      // Check if similar condition already exists
      const existingCondition = await Condition.findOne({
        formId,
        pageId,
        sourcePage,
        questionIds: { $all: questionIds, $size: questionIds.length },
      });

      if (existingCondition) {
        return res.status(400).json({
          success: false,
          message:
            "A condition with the same questions already exists for this page",
          existingCondition,
        });
      }

      const condition = new Condition({
        formId,
        pageId,
        questionIds,
        rules: validatedRules,
        sourcePage,
        destinationPage,
        logicOperator,
      });

      await condition.save();

      // Populate the response with question details
      await condition.populate("rules.questionId", "question options");
      await condition.populate("sourcePage", "title order");
      await condition.populate("destinationPage", "title order");

      res.status(201).json({
        success: true,
        message: "Condition created successfully",
        data: condition,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating condition",
        error,
      });
    }
  }

  // Get conditions by form and page
  //   static async getConditions(req: Request, res: Response) {
  //     try {
  //       const { formId, pageId } = req.params;

  //       const conditions = await Condition.find({
  //         formId,
  //         pageId,
  //       })
  //         .populate("questionId", "question options")
  //         .populate("sourcePage", "title order")
  //         .populate("destinationPage", "title order");

  //       res.status(200).json({
  //         success: true,
  //         data: conditions,
  //       });
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         message: "Error fetching conditions",
  //         error,
  //       });
  //     }
  //   }

  // Update condition
  //   static async updateCondition(req: Request, res: Response) {
  //     try {
  //       const { conditionId } = req.params;
  //       const updates = req.body;

  //       const condition = await Condition.findByIdAndUpdate(
  //         conditionId,
  //         updates,
  //         { new: true }
  //       );

  //       if (!condition) {
  //         return res.status(404).json({
  //           success: false,
  //           message: "Condition not found",
  //         });
  //       }

  //       res.status(200).json({
  //         success: true,
  //         message: "Condition updated successfully",
  //         data: condition,
  //       });
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         message: "Error updating condition",
  //         error,
  //       });
  //     }
  //   }

  // Delete condition
  //   static async deleteCondition(req: Request, res: Response) {
  //     try {
  //       const { conditionId } = req.params;

  //       const condition = await Condition.findByIdAndDelete(conditionId);

  //       if (!condition) {
  //         return res.status(404).json({
  //           success: false,
  //           message: "Condition not found",
  //         });
  //       }

  //       res.status(200).json({
  //         success: true,
  //         message: "Condition deleted successfully",
  //       });
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         message: "Error deleting condition",
  //         error,
  //       });
  //     }
  //   }

  // MAIN LOGIC: Evaluate conditions and get next page
  static async evaluateConditions(req: Request, res: Response) {
    try {
      const { formId, pageId, answers } = req.body;
      // answers format: [{ questionId: "id1", selectedOptions: ["option1"] }, ...]

      // Validate input
      if (!formId || !pageId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: "formId, pageId and answers array are required",
        });
      }

      // Get all conditions for this form and page
      const conditions = await Condition.find({
        formId,
        sourcePage: pageId,
      });

      // Check each condition
      for (const condition of conditions) {
        let allRulesMatched = true;

        // Check if ALL rules in the condition match (AND logic only)
        for (const rule of condition.rules) {
          // Find user's answer for this question
          const userAnswer = answers.find(
            (answer) => answer.questionId === rule.questionId.toString()
          );

          // If no answer found or admin answer not in selected options
          if (
            !userAnswer ||
            !userAnswer.selectedOptions ||
            !userAnswer.selectedOptions.includes(rule.adminAnswer)
          ) {
            allRulesMatched = false;
            break; // Exit early if any rule doesn't match
          }
        }

        // If all rules matched, return destination page
        if (allRulesMatched) {
          return res.status(200).json({
            success: true,
            nextPageId: condition.destinationPage,
          });
        }
      }

      // No condition matched, get default next page (by order)
      const currentPage = await Page.findById(pageId);
      if (!currentPage) {
        return res.status(404).json({
          success: false,
          message: "Current page not found",
        });
      }

      // Find next page by order (incremental)
      const nextPage = await Page.findOne({
        formId,
        order: currentPage.order + 1,
      });

      // Return next page ID or null if form complete
      res.status(200).json({
        success: true,
        nextPageId: nextPage ? nextPage._id : null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error evaluating conditions",
        error,
      });
    }
  }

  // Helper method for getting sequences (simplified version)
  static async getSequencesForPage(req: Request, res: Response) {
    try {
      const { formId, pageId } = req.body;

      // Check if conditions exist for this page
      const conditions = await Condition.find({
        formId,
        sourcePage: pageId,
      }).populate("destinationPage", "title order");
      // console.log("conditons", conditions);

      if (conditions.length === 0) {
        return res.json({
          hasConditions: false,
          message: "No conditions found for this page",
        });
      }

      // Get all pages
      const allPages = await Page.find({ formId }).sort({ order: 1 });
      const currentPage = allPages.find((p) => p._id.toString() === pageId);

      if (!currentPage) {
        return res.json({
          hasConditions: false,
          message: "Page not found",
        });
      }

      // Build sequences
      const buildSequence = (startPage: any, useConditions: boolean) => {
        const sequence = [];
        const sourcePage = startPage;

        // Always add the source page first
        sequence.push({
          pageId: sourcePage._id,
          pageName: `Page ${sourcePage.order.toString().padStart(2, "0")}`,
          pageOrder: sourcePage.order,
        });

        if (useConditions) {
          // Find the first matching condition for this source page
          const pageConditions = conditions.filter(
            (c) => c.sourcePage.toString() === sourcePage._id.toString()
          );
          console.log("pageConditions", pageConditions);
          if (pageConditions.length > 0) {
            // Handle both ObjectId and populated object for destinationPage
            const destPage = pageConditions[0].destinationPage;
            const destPageId =
              typeof destPage === "object" &&
              destPage !== null &&
              "_id" in destPage
                ? (destPage._id as string | { toString(): string }).toString()
                : destPage.toString();

            const destinationPage = allPages.find(
              (p) => p._id.toString() === destPageId
            );

            if (destinationPage) {
              // Add the destination page
              sequence.push({
                pageId: destinationPage._id,
                pageName: `Page ${destinationPage.order.toString().padStart(2, "0")}`,
                pageOrder: destinationPage.order,
              });
              // Add all pages after the destination page by order
              const pagesAfterDest = allPages.filter(
                (p) => p.order > destinationPage.order
              );
              for (const p of pagesAfterDest) {
                sequence.push({
                  pageId: p._id,
                  pageName: `Page ${p.order.toString().padStart(2, "0")}`,
                  pageOrder: p.order,
                });
              }
            }
          }
        } else {
          // False scenario: add all pages after the source page by order
          const pagesAfterSource = allPages.filter(
            (p) => p.order > sourcePage.order
          );
          for (const p of pagesAfterSource) {
            sequence.push({
              pageId: p._id,
              pageName: `Page ${p.order.toString().padStart(2, "0")}`,
              pageOrder: p.order,
            });
          }
        }

        return sequence;
      };

      return res.json({
        hasConditions: true,
        trueSequence: buildSequence(currentPage, true),
        falseSequence: buildSequence(currentPage, false),
        conditionsCount: conditions.length,
      });
    } catch (error) {
      return res.status(500).json({
        hasConditions: false,
        message: "Error processing sequences",
        error,
      });
    }
  }

  // Helper method to get next page ID (simplified)
  static async getNextPageId(
    formId: string,
    pageId: string,
    answers: { questionId: string; selectedOptions: string[] }[]
  ): Promise<{
    nextPageId: string | null;
    sequenceType: "conditional" | "default";
  }> {
    try {
      // Get conditions for current page
      const conditions = await Condition.find({
        formId,
        sourcePage: pageId,
      });

      // Check each condition
      for (const condition of conditions) {
        let allRulesMatched = true;

        // Check if ALL rules match
        for (const rule of condition.rules) {
          const userAnswer = answers.find(
            (answer) => answer.questionId === rule.questionId.toString()
          );

          if (
            !userAnswer ||
            !userAnswer.selectedOptions ||
            !userAnswer.selectedOptions.includes(rule.adminAnswer)
          ) {
            allRulesMatched = false;
            break;
          }
        }

        // If all rules matched, return destination page (TRUE SEQUENCE)
        if (allRulesMatched) {
          return {
            nextPageId: condition.destinationPage.toString(),
            sequenceType: "conditional",
          };
        }
      }

      // Get default next page by order (FALSE SEQUENCE)
      const currentPage = await Page.findById(pageId);
      if (!currentPage) {
        return { nextPageId: null, sequenceType: "default" };
      }

      const nextPage = await Page.findOne({
        formId,
        order: currentPage.order + 1,
      });

      return {
        nextPageId: nextPage ? nextPage._id.toString() : null,
        sequenceType: "default",
      };
    } catch (error) {
      console.error("Error getting next page ID:", error);
      return { nextPageId: null, sequenceType: "default" };
    }
  }
}
