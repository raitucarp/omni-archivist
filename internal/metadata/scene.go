package metadata

type Scene struct {
	Goal struct {
		Description string `json:"description" jsonschema:"description=What the POV character wants right now"`
		Stakes      struct {
			External string `json:"external" jsonschema:"description=What they might lose in the world"`
			Internal string `json:"internal" jsonschema:"description=What it costs emotionally or morally"`
		} `json:"stakes" jsonschema:"description=What is at risk if they fail to achieve the goal"`
	} `json:"goal" jsonschema:"description=The immediate objective of the scene"`
	Conflict struct {
		Opposition struct {
			Type        string `json:"type" jsonschema:"description=person | environment | system | self"`
			Description string `json:"description" jsonschema:"description=Who or what resists the goal"`
		} `json:"opposition" jsonschema:"description=The opposing force"`
		Escalation struct {
			Beats []string `json:"beats" jsonschema:"description=The escalating events that build tension"`
		} `json:"escalation"`
	} `json:"conflict" jsonschema:"description=The opposing force"`
	Disaster struct {
		Outcome     string `json:"outcome" jsonschema:"description=Failure | Partial success | Success with cost | Success"`
		Consequence struct {
			Plot      string `json:"plot" jsonschema:"description=How this changes the overall story"`
			Character string `json:"character" jsonschema:"description=How this affects the POV character emotionally or morally"`
		} `json:"consequence" jsonschema:"description=The fallout from the scene's climax"`
	} `json:"disaster" jsonschema:"description=The scene's climax and its fallout"`
}
