package metadata

type Story struct {
	Title        string        `yaml:"title" json:"title" jsonschema:"description=The title of the story"`
	Subtitle     string        `yaml:"subtitle" json:"subtitle" jsonschema:"description=Subtitle of title of story"`
	Blurb        string        `yaml:"blurb" json:"blurb" jsonschema:"description=A short summary or teaser of the story"`
	Logline      string        `yaml:"logline" json:"logline" jsonschema:"description=A one-sentence summary of the story's main plot"`
	Synopsis     string        `yaml:"synopsis" json:"synopsis" jsonschema:"description=A brief overview of the story's plot, characters, and setting"`
	Structure    Structure     `yaml:"structure" json:"structure" jsonschema:"description=The narrative structure of the story."`
	Characters   []Character   `yaml:"characters" json:"characters" jsonschema:"description=List of main characters in the story"`
	SceneSequels []SceneSequel `yaml:"scene_sequels,omitempty" json:"scene_sequels,omitempty" jsonschema:"description=List of scene and sequel pairs that make up the story"`
	POV          string        `yaml:"pov" json:"pov" jsonschema:"enum=first_person,enum=third_person_limited,enum=third_person_omniscient,description=Story point of view determines the narrator's perspective, influencing reader intimacy and information access."`
	ImagePrompt  string        `yaml:"image_prompt" json:"image_prompt" jsonschema:"description=Prompt for generating a visual, an image that represents the story."`
}
