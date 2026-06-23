// A fixed list instead of a free-text box: keeps event categories
// consistent (no "Gaming" vs "gaming" vs "games" fragmenting the same
// kind of event into three different strings), and lets the events list
// page filter by category later without first having to clean messy data.
const EVENT_CATEGORIES = [
  "Gaming",
  "Sports",
  "Fitness & Wellness",
  "Hiking & Outdoors",
  "Music",
  "Concerts & Festivals",
  "Food & Drink",
  "Movies & Film",
  "Art & Culture",
  "Books & Literature",
  "Technology",
  "Networking & Business",
  "Volunteering & Charity",
  "Travel",
  "Photography",
  "Dance",
  "Theater & Performing Arts",
  "Comedy",
  "Workshops & Classes",
  "Nightlife",
  "Pets & Animals",
  "Family & Kids",
  "Board Games & Tabletop",
  "Crafts & DIY",
  "Other",
];

export { EVENT_CATEGORIES };
