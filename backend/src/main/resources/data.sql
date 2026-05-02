-- ============================================
-- 01Blog Seed Data (Fixed)
-- Password for all users: "password123"
-- ============================================

-- =========================
-- USERS
-- =========================

INSERT INTO users (username, email, password_hash, role, created_at, is_banned)
VALUES
-- Admin account
('admin', 'admin@01blog.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'ADMIN',
 NOW(),
 false),

-- Regular users
('john_dev', 'john@mail.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'USER',
 NOW(),
 false),

('sarah_writer', 'sarah@mail.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'USER',
 NOW(),
 false),

('alex_designer', 'alex@mail.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'USER',
 NOW(),
 false),

('maria_student', 'maria@mail.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'USER',
 NOW(),
 false),

-- Banned spammer
('spammer_account', 'spam@mail.com',
 '$2a$10$F89SEmAtiVBP87yrIIrnm.GrUd7UyawqY1u44l5G1EtExRZmAe/EC',
 'USER',
 NOW(),
 true);


-- =========================
-- SUBSCRIPTIONS
-- =========================

INSERT INTO subscriptions (subscriber_id, target_id, created_at)
VALUES
-- john_dev follows everyone
(2, 3, NOW() - INTERVAL '5 days'),
(2, 4, NOW() - INTERVAL '4 days'),
(2, 5, NOW() - INTERVAL '3 days'),

-- sarah_writer follows john and alex
(3, 2, NOW() - INTERVAL '5 days'),
(3, 4, NOW() - INTERVAL '2 days'),

-- alex_designer follows sarah and maria
(4, 3, NOW() - INTERVAL '4 days'),
(4, 5, NOW() - INTERVAL '1 day'),

-- maria_student follows john and sarah
(5, 2, NOW() - INTERVAL '3 days'),
(5, 3, NOW() - INTERVAL '2 days'),

-- admin follows john
(1, 2, NOW() - INTERVAL '6 days');


-- =========================
-- POSTS
-- =========================

INSERT INTO posts (user_id, title, content, media_url, media_type, hidden, created_at, updated_at)
VALUES
-- Admin posts
(1,
 'Welcome to 01Blog!',
 'Welcome to 01Blog! 🎉 This platform is designed to help you share your learning journey. Feel free to post about what you''re discovering, the challenges you''re facing, and the victories you''re celebrating. Let''s build a supportive community together!',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '7 days',
 NOW() - INTERVAL '7 days'),

-- John's posts
(2,
 'JWT Authentication in Spring Boot',
 'Just finished implementing JWT authentication in my Spring Boot app! The key is understanding the filter chain and how to properly validate tokens. Here are my key takeaways: 1) Always use environment variables for secrets, 2) Set reasonable expiration times, 3) Implement refresh tokens for better UX.',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '6 days',
 NOW() - INTERVAL '6 days'),

(2,
 'Docker Multi-stage Builds',
 'Docker has completely changed my development workflow. No more "it works on my machine" problems! Here''s my Dockerfile for a Spring Boot app with multi-stage builds for smaller images.',
 'https://images.unsplash.com/photo-1605745341112-85968b19335b',
 'IMAGE',
 false,
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days'),

(2,
 'Understanding @Service vs @Component',
 'Finally understood the difference between @Service and @Component in Spring! While functionally they''re similar, using @Service makes your code more semantic and clearly indicates business logic layers. Clean architecture matters!',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days'),

-- Sarah's posts
(3,
 'Learning Angular',
 'Started learning Angular today and I''m impressed by how well TypeScript catches errors at compile time. Coming from vanilla JavaScript, this is a game-changer. The learning curve is steep but worth it!',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '5 days'),

(3,
 'My Documentation Workflow',
 'My documentation workflow: 1) Write code, 2) Add inline comments for complex logic, 3) Create README with setup instructions, 4) Add API documentation with examples. Good docs save so much time later!',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '3 days'),

(3,
 'First Technical Blog Post',
 'Just published my first technical blog post! Writing about what you learn is such a powerful way to solidify your understanding. Plus, it helps others who are on the same journey. Win-win! 📝',
 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
 'IMAGE',
    false,
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Alex's posts
(4,
 'Design Consistency Tip',
 'Design tip: Consistency > Creativity. Users don''t want to relearn your interface on every page. Stick to established patterns, use a design system, and only innovate where it truly adds value.',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '5 days'),

(4,
 'Color Theory for Developers',
 'Color theory for developers: Don''t just pick colors that look good together. Consider accessibility (WCAG contrast ratios), color blindness (use patterns in addition to colors), and cultural meanings. Design is about solving problems, not just making things pretty.',
 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
 'IMAGE',
 false,
 NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '3 days'),

-- Maria's posts
(5,
 'Full-Stack Week 1 Progress',
 'Week 1 of my full-stack journey: HTML/CSS ✅, JavaScript basics ✅, Git fundamentals ✅. The amount I need to learn is overwhelming, but breaking it down into weekly goals helps. One step at a time!',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days'),

(5,
 'Promises & Async/Await',
 'Had my first "aha!" moment with promises and async/await today. Finally clicked why we need them. The callback hell examples in tutorials make so much more sense now! 💡',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days'),

(5,
 'My First REST API',
 'Built my first REST API today! It''s just a simple CRUD app for a todo list, but I''m so proud. All those HTTP methods finally make sense when you build something real.',
 'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
 'IMAGE',
  false,
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Spam post (will be reported)
(6,
 'Get Followers Fast!',
 '🚀 AMAZING OPPORTUNITY 🚀 Get 10,000 followers INSTANTLY! Buy followers, likes, and comments at cheap-followers-scam.example.com! Limited time offer! Click now! 💰💰💰',
 NULL,
 NULL,
 false,
 NOW() - INTERVAL '12 hours',
 NOW() - INTERVAL '12 hours');


-- =========================
-- COMMENTS
-- =========================

INSERT INTO comments (post_id, user_id, content, created_at)
VALUES
(1, 2, 'Thanks for creating this platform! Excited to share and learn with everyone.', NOW() - INTERVAL '7 days'),
(1, 3, 'Great initiative! Looking forward to documenting my journey here.', NOW() - INTERVAL '6 days'),
(2, 3, 'This is super helpful! I''ve been struggling with JWT implementation. Did you handle refresh tokens too?', NOW() - INTERVAL '6 days'),
(2, 5, 'Saved this post for later. I''m not at Spring Security yet but this will be valuable soon!', NOW() - INTERVAL '5 days'),
(2, 1, 'Good explanation. Also recommend storing tokens in httpOnly cookies for additional security against XSS attacks.', NOW() - INTERVAL '5 days'),
(3, 4, 'Multi-stage builds are a lifesaver for image size! Do you use Docker Compose for local development too?', NOW() - INTERVAL '4 days'),
(3, 3, 'I need to learn Docker. Adding it to my learning roadmap!', NOW() - INTERVAL '3 days'),
(5, 2, 'Welcome to the Angular world! Wait until you discover RxJS - it''s powerful but has a learning curve.', NOW() - INTERVAL '5 days'),
(5, 4, 'TypeScript is amazing once you get used to it. The autocomplete alone is worth it!', NOW() - INTERVAL '4 days'),
(8, 3, 'As someone who writes docs, I totally agree. Consistency makes everything easier to understand and use.', NOW() - INTERVAL '5 days'),
(8, 2, 'This is why I love using design systems like Material UI. Consistency built-in!', NOW() - INTERVAL '4 days'),
(10, 2, 'Great progress! Keep up the momentum. The beginning is always the hardest but it gets easier.', NOW() - INTERVAL '4 days'),
(10, 3, 'Love seeing your weekly updates! You''re making great progress.', NOW() - INTERVAL '3 days'),
(13, 2, 'This is clearly spam. Reporting this.', NOW() - INTERVAL '10 hours');


-- =========================
-- LIKES
-- =========================

INSERT INTO likes (user_id, post_id, created_at)
VALUES
(2, 1, NOW() - INTERVAL '7 days'),
(3, 1, NOW() - INTERVAL '6 days'),
(4, 1, NOW() - INTERVAL '6 days'),
(5, 1, NOW() - INTERVAL '5 days'),
(1, 2, NOW() - INTERVAL '6 days'),
(3, 2, NOW() - INTERVAL '6 days'),
(4, 2, NOW() - INTERVAL '5 days'),
(5, 2, NOW() - INTERVAL '5 days'),
(3, 3, NOW() - INTERVAL '4 days'),
(4, 3, NOW() - INTERVAL '4 days'),
(5, 3, NOW() - INTERVAL '3 days'),
(2, 5, NOW() - INTERVAL '5 days'),
(4, 5, NOW() - INTERVAL '4 days'),
(2, 6, NOW() - INTERVAL '3 days'),
(5, 6, NOW() - INTERVAL '2 days'),
(2, 7, NOW() - INTERVAL '1 day'),
(4, 7, NOW() - INTERVAL '1 day'),
(5, 7, NOW() - INTERVAL '20 hours'),
(2, 8, NOW() - INTERVAL '5 days'),
(3, 8, NOW() - INTERVAL '4 days'),
(2, 9, NOW() - INTERVAL '3 days'),
(3, 9, NOW() - INTERVAL '2 days'),
(2, 10, NOW() - INTERVAL '4 days'),
(3, 10, NOW() - INTERVAL '3 days'),
(2, 11, NOW() - INTERVAL '2 days'),
(3, 11, NOW() - INTERVAL '1 day'),
(2, 12, NOW() - INTERVAL '1 day'),
(3, 12, NOW() - INTERVAL '20 hours'),
(4, 12, NOW() - INTERVAL '18 hours');


-- =========================
-- NOTIFICATIONS
-- =========================

INSERT INTO notifications (user_id, type, message, reference_id, is_read, created_at)
VALUES
(2, 'NEW_FOLLOWER', 'sarah_writer started following you', NULL, true, NOW() - INTERVAL '5 days'),
(2, 'NEW_COMMENT', 'admin commented on your post', 2, true, NOW() - INTERVAL '5 days'),
(2, 'NEW_FOLLOWER', 'maria_student started following you', NULL, false, NOW() - INTERVAL '3 days'),
(3, 'NEW_FOLLOWER', 'john_dev started following you', NULL, true, NOW() - INTERVAL '5 days'),
(3, 'NEW_COMMENT', 'john_dev liked your post', 5, true, NOW() - INTERVAL '5 days'),
(3, 'NEW_FOLLOWER', 'alex_designer started following you', NULL, false, NOW() - INTERVAL '4 days'),
(3, 'NEW_FOLLOWER', 'maria_student started following you', NULL, false, NOW() - INTERVAL '2 days'),
(4, 'NEW_FOLLOWER', 'john_dev started following you', NULL, true, NOW() - INTERVAL '4 days'),
(4, 'NEW_COMMENT', 'sarah_writer liked your post', 8, false, NOW() - INTERVAL '4 days'),
(5, 'NEW_FOLLOWER', 'john_dev started following you', NULL, true, NOW() - INTERVAL '3 days'),
(5, 'NEW_COMMENT', 'john_dev commented on your post', 10, false, NOW() - INTERVAL '4 days'),
(5, 'NEW_COMMENT', 'john_dev liked your post', 12, false, NOW() - INTERVAL '1 day');


-- =========================
-- REPORTS
-- =========================

INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, status, created_at)
VALUES
(2, 6, NULL, 'Spam content promoting fake follower services. Post contains misleading claims and suspicious links.', 'PENDING', NOW() - INTERVAL '10 hours'),
(3, 6, NULL, 'User is posting promotional spam. Account appears to be a bot.', 'PENDING', NOW() - INTERVAL '8 hours'),
(5, 6, NULL, 'Obvious spam account. Should be banned.', 'PENDING', NOW() - INTERVAL '6 hours'),
(1, 6, NULL, 'Initial spam report - confirmed and user has been banned.', 'RESOLVED', NOW() - INTERVAL '2 days');
