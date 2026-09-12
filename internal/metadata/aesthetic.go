package metadata

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

// VisualAesthetic encapsulates artistic and visual choices for cover generation.
type VisualAesthetic struct {
	ArtStyle      string `yaml:"art_style" json:"art_style" jsonschema:"description=The visual medium or art movement, e.g. 70s vintage pulp, cyberpunk neo-noir, Moebius ligne claire"`
	ColorPalette  string `yaml:"color_palette" json:"color_palette" jsonschema:"description=Dominant color scheme and lighting palette"`
	Composition   string `yaml:"composition" json:"composition" jsonschema:"description=Framing and camera perspective"`
	Lighting      string `yaml:"lighting" json:"lighting" jsonschema:"description=Lighting quality, angle, and atmosphere"`
	Mood          string `yaml:"mood" json:"mood" jsonschema:"description=Emotional resonance and atmosphere of the artwork"`
	SubjectMatter string `yaml:"subject_matter" json:"subject_matter" jsonschema:"description=Primary visual subject or motif aligned with the synopsis"`
	Prompt        string `yaml:"prompt" json:"prompt" jsonschema:"description=Final synthesized prompt passed to the image generation model"`
}

var ArtStyles = []string{
	"1970s vintage analog sci-fi paperback cover art, painted gouache and acrylic texture",
	"retro-futuristic 1950s pulp sci-fi illustration with vibrant half-tone print texture",
	"cyberpunk neo-noir cinematic concept art with rain-slicked reflective surfaces",
	"Moebius-inspired European ligne claire sci-fi graphic novel art style, crisp ink outlines and flat pastel gradients",
	"Syd Mead industrial futurism architectural concept painting with precision mechanical forms",
	"monolithic hard science-fiction matte painting with realistic scale and scientific fidelity",
	"Bauhaus constructivist minimalist sci-fi book jacket design with bold geometry",
	"dark surrealist biopunk illustration with organic alien biomechanics",
	"solarpunk stained-glass architectural concept with lush bioluminescent flora and sleek brass",
	"analog grainy risograph print with stylized limited-color duotone sci-fi aesthetic",
	"cinematic 70mm Panavision sci-fi keyframe with anamorphic lens flare and film grain",
	"ethereal cosmic surrealism with painterly nebulas and celestial geometric portals",
}

var ColorPalettes = []string{
	"neon noir: deep cyan, electric magenta, and obsidian black with high contrast",
	"monochromatic amber and dark umber: reminiscent of vintage phosphor computer monitors",
	"deep void: velvet black space, icy crystalline whites, and sharp electric blue rim accents",
	"bioluminescent abyssal: deep ocean indigo, vibrant turquoise, and phosphorescent violet",
	"solar flare: incandescent gold, searing cadmium orange, and deep volcanic sienna",
	"martian rust: oxidized red dust, raw copper, and pale peach horizon",
	"sterile clinical: surgical ceramic white, glacial frost blue, and polished chrome",
	"infrared spectral: false-color ultraviolet, glowing crimson, and radioactive acid green",
	"vintage vaporwave: twilight lavender, dusty dusty rose, and muted mint green",
	"industrial brutalist: weathered concrete gray, damp asphalt, and vivid hazard yellow",
}

var Compositions = []string{
	"cinematic ultrawide 2.39:1 aspect ratio with sweeping panoramic vista",
	"extreme low-angle heroic perspective looking up at colossal towering megastructure",
	"intimate high-contrast claustrophobic close-up with intense shallow depth of field",
	"dramatic symmetrical one-point perspective corridor receding infinitely into the unknown",
	"dutch angle dynamic diagonal composition conveying high psychological tension and vertigo",
	"vast solitary horizon with lone minute figure emphasizing terrifying cosmic scale",
	"centralized enigmatic artifact floating in zero gravity surrounded by intricate orbital debris",
	"isometric cutaway architectural perspective revealing labyrinthine alien interior",
}

var LightingSetups = []string{
	"dramatic volumetric god rays cutting through dense swirling atmospheric dust and mist",
	"harsh chiaroscuro rim lighting from a dying binary star on the edge of the eclipse",
	"flickering CRT monitor glow casting eerie monochrome patterns in pitch darkness",
	"soft diffused starlight through planetary rings with ethereal silver shadows",
	"pulsing alien bioluminescence illuminating damp organic cavern walls",
	"blinding searchlight beams piercing through perpetual toxic rain and industrial steam",
	"warm golden-hour celestial glow contrasting against deep cold space shadows",
}

var Moods = []string{
	"cosmic existential dread and awe before the incomprehensible scale of the universe",
	"quiet contemplative solitude drifting through the silent void",
	"claustrophobic cybernetic paranoia in a dystopian surveillance labyrinth",
	"haunting melancholy amidst the decaying ruins of an ancient interstellar civilization",
	"electrifying scientific wonder on the brink of an unprecedented discovery",
	"gritty dangerous survival against a merciless alien environment",
	"mystical reverie touching the boundaries of synthetic consciousness and transcendence",
}

func randomChoice(slice []string) string {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(len(slice))))
	if err != nil || n == nil {
		return slice[0]
	}
	return slice[n.Int64()]
}

// RandomAesthetic selects random visual aesthetic enums to seed cover art generation.
func RandomAesthetic() VisualAesthetic {
	return VisualAesthetic{
		ArtStyle:     randomChoice(ArtStyles),
		ColorPalette: randomChoice(ColorPalettes),
		Composition:  randomChoice(Compositions),
		Lighting:     randomChoice(LightingSetups),
		Mood:         randomChoice(Moods),
	}
}

// Summary returns a readable description of the aesthetic parameters.
func (v VisualAesthetic) Summary() string {
	return fmt.Sprintf("Style: %s | Palette: %s | Framing: %s | Lighting: %s | Mood: %s",
		v.ArtStyle, v.ColorPalette, v.Composition, v.Lighting, v.Mood)
}
