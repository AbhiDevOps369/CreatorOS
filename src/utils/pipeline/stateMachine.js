
import { transitions } from "./transitions.js"

const canTransition = (currentStage, action, role) => {
    const stageRules = transitions[currentStage]
    if (!stageRules) return null

    const actionRule = stageRules[action]
    if (!actionRule) return null

    if (!actionRule.roles.includes(role)) return null

    return actionRule.to
}

export { canTransition }