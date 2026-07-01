const transitions = {
    created: {
        "allocate-team": { roles: ["owner", "manager"], to: "footage_collection" }  
    },
    footage_collection: {
        "submit-footage": { roles: ["contributor"], to: "footage_review" }
    },
    footage_review: {
        "approve-footage": { roles: ["reviewer"], to: "editing" },
        "reject-footage": { roles: ["reviewer"], to: "footage_collection" }          
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