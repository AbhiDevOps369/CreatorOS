/*
 * Frontend mirror of the backend state machine (src/utils/pipeline/transition.js).
 * The backend is the enforcer; this map only decides what to *show*.
 * Note the asymmetry: reject-footage returns to footage_collection, but
 * request-changes returns to editing only — footage is never reopened.
 */
export const TRANSITIONS = {
  created: {
    "allocate-team": { roles: ["owner", "manager"], to: "footage_collection" },
  },
  footage_collection: {
    "submit-footage": { roles: ["contributor"], to: "footage_review" },
  },
  footage_review: {
    "approve-footage": { roles: ["reviewer"], to: "editing" },
    "reject-footage": { roles: ["reviewer"], to: "footage_collection" },
  },
  editing: {
    "submit-edit": { roles: ["contributor"], to: "edit_review" },
  },
  edit_review: {
    "approve-edit": { roles: ["reviewer"], to: "edit_review" }, // stays — sets editApproved
    "request-changes": { roles: ["reviewer"], to: "editing" },
    deliver: { roles: ["manager", "owner"], to: "delivered" },
  },
  delivered: {},
};

export const STAGES = [
  "created",
  "footage_collection",
  "footage_review",
  "editing",
  "edit_review",
  "delivered",
];

export const STAGE_LABELS = {
  created: "Created",
  footage_collection: "Footage",
  footage_review: "Footage Review",
  editing: "Editing",
  edit_review: "Edit Review",
  delivered: "Delivered",
};

export const stageIndex = (stage) => STAGES.indexOf(stage);

export const canDo = (action, role, stage) =>
  Boolean(TRANSITIONS[stage]?.[action]?.roles.includes(role));

export const canAllocateTeam = (role, stage) => canDo("allocate-team", role, stage);
export const canSubmitFootage = (role, stage) => canDo("submit-footage", role, stage);
export const canApproveFootage = (role, stage) => canDo("approve-footage", role, stage);
export const canRejectFootage = (role, stage) => canDo("reject-footage", role, stage);
export const canSubmitEdit = (role, stage) => canDo("submit-edit", role, stage);
export const canApproveEdit = (role, stage) => canDo("approve-edit", role, stage);
export const canRequestChanges = (role, stage) => canDo("request-changes", role, stage);
export const canDeliver = (role, stage, editApproved) =>
  canDo("deliver", role, stage) && Boolean(editApproved);

export const isManagerial = (role) => role === "owner" || role === "manager";
export const canCreateTask = (role) => ["owner", "manager", "reviewer"].includes(role);
export const canManageSubtasks = (role) => ["owner", "manager", "reviewer"].includes(role);
export const canCreateNote = (role) => ["owner", "manager", "reviewer"].includes(role);

/* Roles a manager/owner can hand out when staffing a project. */
export const ASSIGNABLE_ROLES = ["manager", "contributor", "reviewer"];

/* One line under the pipeline explaining whose move it is. */
export const STAGE_HINTS = {
  created: "Waiting for the owner or a manager to allocate the crew.",
  footage_collection: "Waiting on the videographer to submit footage from a task.",
  footage_review: "Footage is with the reviewer — approve to move into editing, or send it back for a re-shoot.",
  editing: "The editor is at work. Submitting the edit requires every subtask to be checked off.",
  edit_review: "The edit is with the reviewer. Once approved, the owner or a manager can deliver.",
  delivered: "Delivered. This project is complete.",
};
