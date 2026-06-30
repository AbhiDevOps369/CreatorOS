const transitions = {
    created: {
        "allocate-team": { roles: ["owner", "manager"], to: "team_allocated" }
    },
    team_allocated: {
        "submit-footage": { roles: ["contributor"], to: "footage_submitted" }
    },
    footage_submitted: {
        // no human actions here — controller auto-advances to footage_review
    },
    footage_review: {
        "approve-footage": { roles: ["reviewer"], to: "editing" },
        "reject-footage": { roles: ["reviewer"], to: "team_allocated" }
    },
    editing: {
        "submit-edit": { roles: ["contributor"], to: "edit_review" }
    },
    edit_review: {

        "approve-edit": { roles: ["reviewer"], to: "edit_review" }, // stays, marks as approved
        "request-changes": { roles: ["reviewer"], to: "editing" },
        "deliver": { roles: ["manager", "owner"], to: "delivered" }
    },
    delivered: {
        // terminal stage — no outgoing transitions
    }
}

export { transitions }