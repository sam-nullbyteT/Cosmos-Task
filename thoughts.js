// 100 Inspiring Book Lines & Thoughts for CosmoTask.
// Curated from classic literature, philosophy, science, and productivity books.

const THOUGHTS = [
  "You have power over your mind - not outside events. Realize this, and you will find strength. \u2014 Marcus Aurelius, Meditations",
  "It is only with the heart that one can see rightly; what is essential is invisible to the eye. \u2014 Antoine de Saint-Exup\u00e9ry, The Little Prince",
  "You do not rise to the level of your goals. You fall to the level of your systems. \u2014 James Clear, Atomic Habits",
  "The mystery of life isn't a problem to solve, but a reality to experience. \u2014 Frank Herbert, Dune",
  "Somewhere, something incredible is waiting to be known. \u2014 Carl Sagan, Cosmos",
  "Clarity about what matters provides clarity about what does not. \u2014 Cal Newport, Deep Work",
  "What you get by achieving your goals is not as important as what you become by achieving your goals. \u2014 Henry David Thoreau, Walden",
  "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. \u2014 Ralph Waldo Emerson, Self-Reliance",
  "The impediment to action advances action. What stands in the way becomes the way. \u2014 Marcus Aurelius, Meditations",
  "A journey of a thousand miles begins with a single step. \u2014 Lao Tzu, Tao Te Ching",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. \u2014 Will Durant, The Story of Philosophy",
  "It is not that we have a short time to live, but that we waste a lot of it. \u2014 Seneca, On the Shortness of Life",
  "When you want something, all the universe conspires in helping you to achieve it. \u2014 Paulo Coelho, The Alchemist",
  "Everything can be taken from a man but one thing: the last of the human freedoms\u2014to choose one's attitude. \u2014 Viktor E. Frankl, Man's Search for Meaning",
  "He who has a why to live can bear almost any how. \u2014 Friedrich Nietzsche, Twilight of the Idols",
  "If you only read the books that everyone else is reading, you can only think what everyone else is thinking. \u2014 Haruki Murakami, Norwegian Wood",
  "Do not go where the path may lead, go instead where there is no path and leave a trail. \u2014 Ralph Waldo Emerson",
  "Beware the barrenness of a busy life. \u2014 Socrates",
  "Simplicity is the prerequisite for reliability. \u2014 Edsger W. Dijkstra",
  "The only true wisdom is in knowing you know nothing. \u2014 Plato, The Republic",
  "In the depth of winter, I finally learned that within me there lay an invincible summer. \u2014 Albert Camus, Return to Tipasa",
  "Life is what happens to us while we are making other plans. \u2014 Allen Saunders",
  "Waste no more time arguing about what a good man should be. Be one. \u2014 Marcus Aurelius, Meditations",
  "The future belongs to those who believe in the beauty of their dreams. \u2014 Eleanor Roosevelt",
  "Knowing others is intelligence; knowing yourself is true wisdom. \u2014 Lao Tzu, Tao Te Ching",
  "Not all those who wander are lost. \u2014 J.R.R. Tolkien, The Fellowship of the Ring",
  "There is nothing permanent except change. \u2014 Heraclitus",
  "Action is the foundational key to all success. \u2014 Pablo Picasso",
  "It always seems impossible until it's done. \u2014 Nelson Mandela, Long Walk to Freedom",
  "The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself. \u2014 Carl Sagan, Cosmos",
  "Dwell on the beauty of life. Watch the stars, and see yourself running with them. \u2014 Marcus Aurelius, Meditations",
  "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. \u2014 Leonardo da Vinci",
  "Little by little, one travels far. \u2014 J.R.R. Tolkien, The Hobbit",
  "Happiness is not something ready-made. It comes from your own actions. \u2014 Dalai Lama, The Art of Happiness",
  "The secret of getting ahead is getting started. \u2014 Mark Twain",
  "Discipline equals freedom. \u2014 Jocko Willink, Extreme Ownership",
  "Small disciplines repeated with consistency every day lead to great achievements. \u2014 John C. Maxwell",
  "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. \u2014 Frank Herbert, Dune",
  "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference. \u2014 Robert Frost",
  "Your time is limited, so don't waste it living someone else's life. \u2014 Walter Isaacson, Steve Jobs",
  "Every strike brings me closer to the next home run. \u2014 Babe Ruth",
  "The best time to plant a tree was 20 years ago. The second best time is now. \u2014 Chinese Proverb",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. \u2014 Winston Churchill",
  "Do what you can, with what you have, where you are. \u2014 Theodore Roosevelt, Autobiography",
  "He who conquers himself is the mightiest warrior. \u2014 Confucius, Analects",
  "Even the darkest night will end and the sun will rise. \u2014 Victor Hugo, Les Mis\u00e9rables",
  "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. \u2014 Antoine de Saint-Exup\u00e9ry, Airman's Odyssey",
  "If you hear a voice within you say 'you cannot paint', then by all means paint, and that voice will be silenced. \u2014 Vincent van Gogh",
  "Great things are done by a series of small things brought together. \u2014 Vincent van Gogh",
  "Man cannot discover new oceans unless he has the courage to lose sight of the shore. \u2014 Andr\u00e9 Gide",
  "Focus is a muscle; the more you practice sustaining attention, the stronger it grows. \u2014 Daniel Goleman, Focus",
  "Efficiency is doing things right; effectiveness is doing the right things. \u2014 Peter Drucker, The Effective Executive",
  "To live is the rarest thing in the world. Most people exist, that is all. \u2014 Oscar Wilde",
  "Until you make the unconscious conscious, it will direct your life and you will call it fate. \u2014 Carl Jung",
  "Courage is resistance to fear, mastery of fear\u2014not absence of fear. \u2014 Mark Twain",
  "The mind is everything. What you think you become. \u2014 The Dhammapada",
  "The soul becomes dyed with the color of its thoughts. \u2014 Marcus Aurelius, Meditations",
  "Nothing in life is to be feared, it is only to be understood. \u2014 Marie Curie",
  "The limits of my language mean the limits of my world. \u2014 Ludwig Wittgenstein, Tractatus Logico-Philosophicus",
  "If you want to build a ship, don't drum up people to collect wood, but teach them to long for the endless sea. \u2014 Antoine de Saint-Exup\u00e9ry",
  "In any moment of decision, the best thing you can do is the right thing, the next best thing is the wrong thing, and the worst thing you can do is nothing. \u2014 Theodore Roosevelt",
  "We suffer more often in imagination than in reality. \u2014 Seneca, Letters from a Stoic",
  "You can't cross the sea merely by standing and staring at the water. \u2014 Rabindranath Tagore",
  "Energy flows where attention goes. \u2014 Tony Robbins, Awaken the Giant Within",
  "The greatest glory in living lies not in never falling, but in rising every time we fall. \u2014 Ralph Waldo Emerson",
  "There are years that ask questions and years that answer. \u2014 Zora Neale Hurston, Their Eyes Were Watching God",
  "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get people interested in you. \u2014 Dale Carnegie, How to Win Friends and Influence People",
  "An unexamined life is not worth living. \u2014 Socrates, Apology",
  "Adopt the pace of nature: her secret is patience. \u2014 Ralph Waldo Emerson",
  "What man actually needs is not a tensionless state but rather the striving and struggling for a worthwhile goal. \u2014 Viktor E. Frankl, Man's Search for Meaning",
  "A person who never made a mistake never tried anything new. \u2014 Albert Einstein",
  "If you are going through hell, keep going. \u2014 Winston Churchill",
  "Make each day your masterpiece. \u2014 John Wooden",
  "The only limit to our realization of tomorrow will be our doubts of today. \u2014 Franklin D. Roosevelt",
  "No pressure, no diamonds. \u2014 Thomas Carlyle",
  "Start where you are. Use what you have. Do what you can. \u2014 Arthur Ashe",
  "Believe you can and you're halfway there. \u2014 Theodore Roosevelt",
  "We don't see things as they are, we see them as we are. \u2014 Ana\u00efs Nin",
  "One day you will look back and see that all along you were blooming. \u2014 Morgan Harper Nichols",
  "Difficulties strengthen the mind, as labor does the body. \u2014 Seneca",
  "Change your thoughts and you change your world. \u2014 Norman Vincent Peale, The Power of Positive Thinking",
  "Never let the fear of striking out keep you from playing the game. \u2014 Babe Ruth",
  "The way to get started is to quit talking and begin doing. \u2014 Walt Disney",
  "It is during our darkest moments that we must focus to see the light. \u2014 Aristotle",
  "Turn your wounds into wisdom. \u2014 Oprah Winfrey",
  "If you don't like something, change it. If you can't change it, change your attitude. \u2014 Maya Angelou",
  "Try not to become a man of success, but rather become a man of value. \u2014 Albert Einstein",
  "Don't count the days, make the days count. \u2014 Muhammad Ali",
  "Success usually comes to those who are too busy to be looking for it. \u2014 Henry David Thoreau",
  "The creation of a thousand forests is in one acorn. \u2014 Ralph Waldo Emerson",
  "Do one thing every day that scares you. \u2014 Eleanor Roosevelt",
  "You miss 100 percent of the shots you don't take. \u2014 Wayne Gretzky",
  "The mind once stretched by a new idea never returns to its original dimensions. \u2014 Oliver Wendell Holmes Jr.",
  "A good traveler has no fixed plans, and is not intent on arriving. \u2014 Lao Tzu",
  "Real integrity is doing the right thing, knowing that nobody's going to know whether you did it or not. \u2014 Oprah Winfrey",
  "Continuous effort - not strength or intelligence - is the key to unlocking our potential. \u2014 Winston Churchill",
  "The sun himself on his island rocks is yet half-hidden in the mist. \u2014 Henry David Thoreau",
  "Out of difficulties grow miracles. \u2014 Jean de La Bruy\u00e8re",
  "Look up at the stars and not down at your feet. Be curious. \u2014 Stephen Hawking, Brief Answers to the Big Questions",
  "Quiet minds cannot be perplexed or frightened, but go on in fortune or misfortune at their own private pace. \u2014 Robert Louis Stevenson"
];

// Ensure the 100 book thoughts load into the app instead of old cached defaults
(function () {
  const STORAGE_KEY = "cosmotask_thoughts_v1";
  const VERSION_KEY = "cosmotask_thoughts_version";
  const CURRENT_VERSION = "v2_100_book_lines";

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const existingVersion = localStorage.getItem(VERSION_KEY);
      const existingThoughtsRaw = localStorage.getItem(STORAGE_KEY);
      let shouldUpdate = false;

      if (existingVersion !== CURRENT_VERSION) {
        shouldUpdate = true;
      } else if (!existingThoughtsRaw) {
        shouldUpdate = true;
      } else {
        const existing = JSON.parse(existingThoughtsRaw);
        if (!Array.isArray(existing) || existing.length <= 15) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(THOUGHTS));
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      }
    } catch (e) {
      console.warn("Storage sync check bypassed:", e);
    }
  }
})();

// Make available globally in browser and module environments
if (typeof window !== "undefined") {
  window.THOUGHTS = THOUGHTS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { THOUGHTS };
}
