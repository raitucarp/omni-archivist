package metadata

type Sequel struct {
	Reaction struct {
		Emotional struct {
			Immediate string `json:"immediate" yaml:"immediate" jsonschema:"description=The immediate emotional response"`
			Physical  string `json:"physical" yaml:"physical" jsonschema:"description=The physical reactions or sensations"`
		} `json:"emotional" yaml:"emotional" jsonschema:"description=The emotional response of the POV character"`
		Processing string `json:"processing" yaml:"processing" jsonschema:"description=How the POV character makes sense of what happened"`
	} `json:"reaction" yaml:"reaction" jsonschema:"description=The POV character's reaction to the scene"`
	Dilemma struct {
		Options []struct {
			Choice string `json:"choice" yaml:"choice" jsonschema:"description=The possible course of action"`
			Cost   string `json:"cost" yaml:"cost" jsonschema:"description=What the POV character must give up or risk"`
			Risk   string `json:"risk" yaml:"risk" jsonschema:"description=The potential negative outcome of this choice"`
		} `json:"options" yaml:"options" jsonschema:"description=The choices available to the POV character"`
	} `json:"dilemma" yaml:"dilemma" jsonschema:"description=The tough choice the POV character faces"`
	Decision struct {
		ChosenOption string `json:"chosen_option" yaml:"chosen_option" jsonschema:"description=The option the POV character selects"`
		Rationale    string `json:"rationale" yaml:"rationale" jsonschema:"description=Why the POV character made this choice"`
		NewGoal      string `json:"new_goal" yaml:"new_goal" jsonschema:"description=The new goal the POV character sets after making their decision"`
	} `json:"decision" yaml:"decision" jsonschema:"description=The POV character's decision and its reasoning"`
}
