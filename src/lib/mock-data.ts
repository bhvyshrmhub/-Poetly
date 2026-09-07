import { Writer, Poem, Comment, Collection, WritingPrompt, Mood } from "./types";

export const writers: Writer[] = [
  {
    id: "maya",
    name: "Maya Chen",
    handle: "@maya",
    avatar: "",
    bio: "I write what I cannot say.",
    poemCount: 42,
    followers: 128,
    following: 73,
  },
  {
    id: "arin",
    name: "Arin Voss",
    handle: "@arin",
    avatar: "",
    bio: "Between the lines, there is always more.",
    poemCount: 35,
    followers: 96,
    following: 54,
  },
  {
    id: "noor",
    name: "Noor Ansari",
    handle: "@noor",
    avatar: "",
    bio: "Words are the quietest form of rebellion.",
    poemCount: 28,
    followers: 210,
    following: 89,
  },
  {
    id: "elias",
    name: "Elias Frost",
    handle: "@elias",
    avatar: "",
    bio: "Poetry is breathing with intention.",
    poemCount: 51,
    followers: 175,
    following: 62,
  },
  {
    id: "mira",
    name: "Mira Solano",
    handle: "@mira",
    avatar: "",
    bio: "Writing through the silence.",
    poemCount: 19,
    followers: 84,
    following: 112,
  },
  {
    id: "rowan",
    name: "Rowan Blake",
    handle: "@rowan",
    avatar: "",
    bio: "Every ending is an invitation.",
    poemCount: 33,
    followers: 142,
    following: 67,
  },
];

export const poems: Poem[] = [
  {
    id: "ocean",
    title: "The Ocean",
    content: `I thought the ocean
was endless

until you left

and suddenly
everything
had an ending.`,
    author: writers[0],
    createdAt: "2 days ago",
    likes: 234,
    comments: 18,
    saves: 67,
    mood: "melancholy",
    tags: ["love", "loss", "ocean"],
  },
  {
    id: "midnight-thoughts",
    title: "Midnight Thoughts",
    content: `The moon knows
what I keep
locked in my chest—

that I am still
made of the same
restless wonder
I was at sixteen,
only older now,
and quieter about it.`,
    author: writers[2],
    createdAt: "5 hours ago",
    likes: 189,
    comments: 24,
    saves: 43,
    mood: "midnight",
    tags: ["midnight", "wonder", "growing"],
  },
  {
    id: "rain-letter",
    title: "A Letter Written in Rain",
    content: `Dear rain,

I have been waiting
for you
the way old houses
wait for storms—

not because they enjoy
the breaking,

but because they know
the sound of water
is the only honest
lullaby left.`,
    author: writers[1],
    createdAt: "1 day ago",
    likes: 312,
    comments: 31,
    saves: 89,
    mood: "rain",
    tags: ["rain", "longing", "nature"],
  },
  {
    id: "small-things",
    title: "Small Things",
    content: `My mother
never said
I love you.

She said
did you eat.

She said
wear a jacket.

She said
call me
when you arrive.

And that was enough.
That was everything.`,
    author: writers[3],
    createdAt: "3 days ago",
    likes: 567,
    comments: 42,
    saves: 201,
    mood: "love",
    tags: ["family", "love", "home"],
  },
  {
    id: "healing",
    title: "On Healing",
    content: `They say
healing is not linear,

but nobody tells you
it looks like this:

two steps forward,
one step back,
and somewhere in between
you learn to dance
with the uneven ground.`,
    author: writers[4],
    createdAt: "6 hours ago",
    likes: 145,
    comments: 12,
    saves: 34,
    mood: "healing",
    tags: ["healing", "growth", "hope"],
  },
  {
    id: "hope",
    title: "Still, There Is Morning",
    content: `I have walked through
the darkest corridors
of my own mind,

and still—
the morning finds me.

Still—
the coffee tastes
like a small mercy.

Still—
my hands reach
for the pen.`,
    author: writers[5],
    createdAt: "12 hours ago",
    likes: 278,
    comments: 19,
    saves: 56,
    mood: "hope",
    tags: ["hope", "morning", "resilience"],
  },
  {
    id: "city-at-3am",
    title: "The City at 3 AM",
    content: `The city
does not sleep—

it just
pretends to be
still,

the way I pretend
I am not
waiting
for your text
to change
everything.`,
    author: writers[0],
    createdAt: "4 days ago",
    likes: 198,
    comments: 15,
    saves: 41,
    mood: "midnight",
    tags: ["city", "night", "longing"],
  },
  {
    id: "grandmother",
    title: "Grandmother's Kitchen",
    content: `There is a country
I can never return to—

not on any map,
not in any airport—

it lives in the smell
of cardamom and cinnamon,
in the sound of her voice
humming old songs
while dough rises
like a quiet prayer.`,
    author: writers[2],
    createdAt: "2 days ago",
    likes: 423,
    comments: 37,
    saves: 156,
    mood: "memories",
    tags: ["home", "memories", "family"],
  },
  {
    id: "leaves",
    title: "What the Leaves Know",
    content: `The leaves
do not grieve
when they fall—

they have spent
all of summer
learning
how to let go.`,
    author: writers[3],
    createdAt: "1 week ago",
    likes: 389,
    comments: 28,
    saves: 132,
    mood: "nature",
    tags: ["nature", "letting go", "autumn"],
  },
  {
    id: "silence",
    title: "A Study in Silence",
    content: `There are seventeen
ways to be silent.

The first
is when you are alone
and the world
finally stops
asking questions.

The last
is when someone
you love
is speaking,
and you choose
to listen
instead of
replying.`,
    author: writers[4],
    createdAt: "3 days ago",
    likes: 256,
    comments: 22,
    saves: 78,
    mood: "melancholy",
    tags: ["silence", "listening", "presence"],
  },
  {
    id: "first-snow",
    title: "First Snow",
    content: `The first snow
arrives
like an apology—

soft,
quiet,
as if the sky
is sorry
for all the noise
it made
in August.`,
    author: writers[5],
    createdAt: "5 days ago",
    likes: 301,
    comments: 25,
    saves: 94,
    mood: "nature",
    tags: ["winter", "snow", "quiet"],
  },
  {
    id: "answering-machine",
    title: "The Answering Machine",
    content: `I found
your voice
on the answering machine—

three years old,
asking me
to leave a message.

I listened
fourteen times
before I realized
I had nothing
left to say
that I hadn't
already said
in my sleep.`,
    author: writers[1],
    createdAt: "1 week ago",
    likes: 345,
    comments: 33,
    saves: 112,
    mood: "melancholy",
    tags: ["loss", "memory", "voice"],
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    author: writers[1],
    content: "That final line stayed with me.",
    createdAt: "1 day ago",
    likes: 12,
  },
  {
    id: "c2",
    author: writers[3],
    content: "Beautifully written. The simplicity is devastating.",
    createdAt: "2 days ago",
    likes: 8,
  },
  {
    id: "c3",
    author: writers[5],
    content: "I felt this in my chest.",
    createdAt: "3 days ago",
    likes: 15,
  },
];

export const collections: Collection[] = [
  {
    id: "midnight-thoughts",
    title: "Midnight Thoughts",
    description: "Poems written between 12 and 4 AM, when the world is quiet enough to hear yourself think.",
    author: writers[0],
    poemCount: 17,
    poems: [poems[1], poems[6]],
  },
  {
    id: "things-i-never-said",
    title: "Things I Never Said",
    description: "The words that lived in my throat until they became poems instead.",
    author: writers[2],
    poemCount: 23,
    poems: [poems[3], poems[7]],
  },
  {
    id: "rain-collection",
    title: "Rain",
    description: "Everything I wrote while listening to rain.",
    author: writers[1],
    poemCount: 12,
    poems: [poems[2]],
  },
  {
    id: "small-mercies",
    title: "Small Mercies",
    description: "Finding God in the ordinary.",
    author: writers[3],
    poemCount: 15,
    poems: [poems[3], poems[8]],
  },
  {
    id: "letters-never-sent",
    title: "Letters Never Sent",
    description: "Words addressed to people who will never read them.",
    author: writers[4],
    poemCount: 9,
    poems: [poems[11]],
  },
  {
    id: "seasons",
    title: "Seasons",
    description: "A year in poems.",
    author: writers[5],
    poemCount: 21,
    poems: [poems[10], poems[8]],
  },
];

export const prompts: WritingPrompt[] = [
  {
    id: "place-you-cannot-return",
    title: "Write about a place you can never return to.",
    description: "It might be a childhood home, a country, a moment in time. Give us the texture of that absence.",
    participants: 342,
    poems: [poems[7], poems[2]],
    createdAt: "Today",
    isActive: true,
  },
  {
    id: "last-text-message",
    title: "Write from the perspective of a text message that was never sent.",
    description: "What did it want to say? What stopped it?",
    participants: 218,
    poems: [poems[6]],
    createdAt: "Yesterday",
  },
  {
    id: "sound-of-home",
    title: "Write about the sound of home.",
    description: "Not the place. The sound. The creaking floor, the distant traffic, the voice calling you for dinner.",
    participants: 156,
    poems: [poems[3]],
    createdAt: "3 days ago",
  },
  {
    id: "incomplete-sentence",
    title: "Start a poem with an incomplete sentence.",
    description: "Let the poem complete itself. See where the unfinished thought leads.",
    participants: 289,
    poems: [poems[0]],
    createdAt: "5 days ago",
  },
  {
    id: "thing-you-lost",
    title: "Write about something you lost that you cannot name.",
    description: "Not an object. A feeling. A version of yourself. A certain kind of light.",
    participants: 178,
    poems: [poems[9]],
    createdAt: "1 week ago",
  },
];

export const moods: Mood[] = [
  { name: "Love", slug: "love", color: "#9E4C5C", icon: "♡" },
  { name: "Loneliness", slug: "loneliness", color: "#6B7B8D", icon: "○" },
  { name: "Hope", slug: "hope", color: "#7A8B5C", icon: "◐" },
  { name: "Rain", slug: "rain", color: "#5C7A8B", icon: "❙❙" },
  { name: "Midnight", slug: "midnight", color: "#3D3D5C", icon: "●" },
  { name: "Memories", slug: "memories", color: "#8B7355", icon: "◎" },
  { name: "Nature", slug: "nature", color: "#5C8B6B", icon: "❋" },
  { name: "Healing", slug: "healing", color: "#7A5C8B", icon: "◌" },
];

export const tags = [
  "#love",
  "#poetry",
  "#midnight",
  "#heartbreak",
  "#life",
  "#rain",
  "#nature",
  "#hope",
  "#memories",
  "#healing",
  "#loss",
  "#growth",
  "#home",
  "#silence",
  "#longing",
];
