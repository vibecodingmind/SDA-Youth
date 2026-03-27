import { db } from '../src/lib/db';

async function main() {
  console.log('Starting seed...');

  // ==================== BIBLE VERSES ====================
  console.log('Seeding Bible Verses...');
  const verses = await Promise.all([
    db.bibleVerse.upsert({
      where: { id: 'verse-1' },
      update: {},
      create: {
        id: 'verse-1',
        reference: 'John 3:16',
        text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
        translation: 'NKJV',
        book: 'John',
        chapter: 3,
        verse: 16,
        category: 'salvation',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-2' },
      update: {},
      create: {
        id: 'verse-2',
        reference: 'Jeremiah 29:11',
        text: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.',
        translation: 'NKJV',
        book: 'Jeremiah',
        chapter: 29,
        verse: 11,
        category: 'hope',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-3' },
      update: {},
      create: {
        id: 'verse-3',
        reference: 'Philippians 4:13',
        text: 'I can do all things through Christ who strengthens me.',
        translation: 'NKJV',
        book: 'Philippians',
        chapter: 4,
        verse: 13,
        category: 'strength',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-4' },
      update: {},
      create: {
        id: 'verse-4',
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd; I shall not want.',
        translation: 'NKJV',
        book: 'Psalms',
        chapter: 23,
        verse: 1,
        category: 'comfort',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-5' },
      update: {},
      create: {
        id: 'verse-5',
        reference: 'Proverbs 3:5-6',
        text: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.',
        translation: 'NKJV',
        book: 'Proverbs',
        chapter: 3,
        verse: 5,
        category: 'trust',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-6' },
      update: {},
      create: {
        id: 'verse-6',
        reference: 'Romans 8:28',
        text: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
        translation: 'NKJV',
        book: 'Romans',
        chapter: 8,
        verse: 28,
        category: 'faith',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-7' },
      update: {},
      create: {
        id: 'verse-7',
        reference: 'Matthew 5:16',
        text: 'Let your light so shine before men, that they may see your good works and glorify your Father in heaven.',
        translation: 'NKJV',
        book: 'Matthew',
        chapter: 5,
        verse: 16,
        category: 'witness',
      },
    }),
    db.bibleVerse.upsert({
      where: { id: 'verse-8' },
      update: {},
      create: {
        id: 'verse-8',
        reference: '1 Corinthians 16:14',
        text: 'Let all that you do be done with love.',
        translation: 'NKJV',
        book: '1 Corinthians',
        chapter: 16,
        verse: 14,
        category: 'love',
      },
    }),
  ]);
  console.log(`Created ${verses.length} Bible verses`);

  // ==================== DEVOTIONALS ====================
  console.log('Seeding Devotionals...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const devotionals = await Promise.all([
    db.devotional.upsert({
      where: { id: 'devotional-1' },
      update: {},
      create: {
        id: 'devotional-1',
        title: 'Walking in Faith',
        content: `Today, let us reflect on what it means to walk by faith and not by sight. Faith is the substance of things hoped for, the evidence of things not seen (Hebrews 11:1).

As young people navigating through life's challenges, we often want to see the full picture before taking a step. But God calls us to trust Him completely, even when the path ahead seems unclear.

**Reflection Questions:**
1. What area of your life requires more faith today?
2. How can you demonstrate trust in God's plan this week?

**Prayer:**
Lord, help me to walk by faith and not by sight. Give me the courage to trust You completely, knowing that Your plans for me are good. Amen.`,
        scripture: '2 Corinthians 5:7',
        scriptureText: 'For we walk by faith, not by sight.',
        author: 'Pastor Michael Johnson',
        date: today,
        tags: 'faith,trust,daily walk',
        isPublished: true,
      },
    }),
    db.devotional.upsert({
      where: { id: 'devotional-2' },
      update: {},
      create: {
        id: 'devotional-2',
        title: 'The Power of Prayer',
        content: `Prayer is our direct line of communication with God. It's not just about asking for things; it's about building a relationship with our Creator.

Jesus taught us to pray with sincerity and faith. When we pray, we acknowledge our dependence on God and invite His presence into our daily lives.

**Key Points:**
- Prayer changes us, not just our circumstances
- Consistent prayer builds spiritual strength
- Prayer is both speaking and listening to God

**Prayer Focus:**
Take time today to pray for someone who has been on your heart. Intercessory prayer is a powerful ministry.`,
        scripture: '1 Thessalonians 5:17',
        scriptureText: 'Pray without ceasing.',
        author: 'Sister Grace Williams',
        date: new Date(today.getTime() - 86400000), // Yesterday
        tags: 'prayer,spiritual growth,relationship with God',
        isPublished: true,
      },
    }),
    db.devotional.upsert({
      where: { id: 'devotional-3' },
      update: {},
      create: {
        id: 'devotional-3',
        title: 'Youth with a Purpose',
        content: `Don't let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.

Young people in the church have a unique calling. Your energy, passion, and fresh perspective are gifts that God wants to use for His glory.

**Today's Challenge:**
Identify one way you can serve in your church or community this week. Remember, you're never too young to make a difference for God's kingdom.`,
        scripture: '1 Timothy 4:12',
        scriptureText: 'Let no one despise your youth, but be an example to the believers in word, in conduct, in love, in spirit, in faith, in purity.',
        author: 'Pastor Michael Johnson',
        date: new Date(today.getTime() - 2 * 86400000), // 2 days ago
        tags: 'youth,purpose,service,example',
        isPublished: true,
      },
    }),
  ]);
  console.log(`Created ${devotionals.length} devotionals`);

  // ==================== VIDEO CATEGORIES ====================
  console.log('Seeding Video Categories...');
  const videoCategories = await Promise.all([
    db.videoCategory.upsert({
      where: { id: 'video-cat-1' },
      update: {},
      create: {
        id: 'video-cat-1',
        name: 'Sermons',
        description: 'Weekly sermons and messages from our pastors',
        slug: 'sermons',
        icon: 'mic',
        order: 1,
      },
    }),
    db.videoCategory.upsert({
      where: { id: 'video-cat-2' },
      update: {},
      create: {
        id: 'video-cat-2',
        name: 'Bible Studies',
        description: 'In-depth Bible study sessions and teachings',
        slug: 'bible-studies',
        icon: 'book-open',
        order: 2,
      },
    }),
    db.videoCategory.upsert({
      where: { id: 'video-cat-3' },
      update: {},
      create: {
        id: 'video-cat-3',
        name: 'Youth Events',
        description: 'Highlights from youth activities and events',
        slug: 'youth-events',
        icon: 'users',
        order: 3,
      },
    }),
    db.videoCategory.upsert({
      where: { id: 'video-cat-4' },
      update: {},
      create: {
        id: 'video-cat-4',
        name: 'Music & Worship',
        description: 'Praise and worship music videos',
        slug: 'music-worship',
        icon: 'music',
        order: 4,
      },
    }),
  ]);
  console.log(`Created ${videoCategories.length} video categories`);

  // ==================== VIDEOS ====================
  console.log('Seeding Videos...');
  const videos = await Promise.all([
    db.video.upsert({
      where: { id: 'video-1' },
      update: {},
      create: {
        id: 'video-1',
        title: 'Walking by Faith - Youth Sabbath Message',
        description: 'A powerful message about trusting God in uncertain times, delivered during our youth Sabbath service.',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        thumbnailUrl: '/thumbnails/faith-walk.jpg',
        duration: 2400, // 40 minutes
        categoryId: 'video-cat-1',
        author: 'Pastor Michael Johnson',
        tags: 'faith,trust,youth,sabbath',
        viewCount: 145,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(today.getTime() - 7 * 86400000),
      },
    }),
    db.video.upsert({
      where: { id: 'video-2' },
      update: {},
      create: {
        id: 'video-2',
        title: 'Understanding the Book of James',
        description: 'Part 1 of our series on the Book of James - Faith in Action.',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        thumbnailUrl: '/thumbnails/james-study.jpg',
        duration: 3600, // 60 minutes
        categoryId: 'video-cat-2',
        author: 'Dr. Sarah Lee',
        tags: 'bible study,james,faith,action',
        viewCount: 89,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date(today.getTime() - 3 * 86400000),
      },
    }),
    db.video.upsert({
      where: { id: 'video-3' },
      update: {},
      create: {
        id: 'video-3',
        title: 'Youth Retreat 2024 Highlights',
        description: 'A recap of our amazing youth retreat with testimonies and memorable moments.',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        thumbnailUrl: '/thumbnails/retreat-2024.jpg',
        duration: 600, // 10 minutes
        categoryId: 'video-cat-3',
        author: 'Media Team',
        tags: 'retreat,youth,community,testimony',
        viewCount: 234,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(today.getTime() - 14 * 86400000),
      },
    }),
    db.video.upsert({
      where: { id: 'video-4' },
      update: {},
      create: {
        id: 'video-4',
        title: 'Praise Medley - Sabbath Worship',
        description: 'A beautiful collection of praise songs from our Sabbath worship service.',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        thumbnailUrl: '/thumbnails/praise-meditation.jpg',
        duration: 1200, // 20 minutes
        categoryId: 'video-cat-4',
        author: 'Worship Team',
        tags: 'worship,praise,music,sabbath',
        viewCount: 312,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date(today.getTime() - 5 * 86400000),
      },
    }),
  ]);
  console.log(`Created ${videos.length} videos`);

  // ==================== DOCUMENT CATEGORIES ====================
  console.log('Seeding Document Categories...');
  const documentCategories = await Promise.all([
    db.documentCategory.upsert({
      where: { id: 'doc-cat-1' },
      update: {},
      create: {
        id: 'doc-cat-1',
        name: 'Bible Study Guides',
        description: 'Study materials and guides for personal and group Bible study',
        slug: 'bible-study-guides',
        icon: 'book',
        order: 1,
      },
    }),
    db.documentCategory.upsert({
      where: { id: 'doc-cat-2' },
      update: {},
      create: {
        id: 'doc-cat-2',
        name: 'Church Resources',
        description: 'Official church documents, forms, and policies',
        slug: 'church-resources',
        icon: 'file-text',
        order: 2,
      },
    }),
    db.documentCategory.upsert({
      where: { id: 'doc-cat-3' },
      update: {},
      create: {
        id: 'doc-cat-3',
        name: 'Youth Ministry Materials',
        description: 'Resources specifically for youth ministry programs',
        slug: 'youth-ministry',
        icon: 'users',
        order: 3,
      },
    }),
    db.documentCategory.upsert({
      where: { id: 'doc-cat-4' },
      update: {},
      create: {
        id: 'doc-cat-4',
        name: 'Devotional Materials',
        description: 'Daily devotional guides and prayer resources',
        slug: 'devotional-materials',
        icon: 'sun',
        order: 4,
      },
    }),
  ]);
  console.log(`Created ${documentCategories.length} document categories`);

  // ==================== DOCUMENTS ====================
  console.log('Seeding Documents...');
  const documents = await Promise.all([
    db.document.upsert({
      where: { id: 'doc-1' },
      update: {},
      create: {
        id: 'doc-1',
        title: 'Quarterly Bible Study Guide - Q1 2024',
        description: 'A comprehensive study guide covering the Book of Romans for the first quarter.',
        fileUrl: '/documents/romans-study-q1-2024.pdf',
        fileName: 'romans-study-q1-2024.pdf',
        fileType: 'pdf',
        fileSize: 2500000, // 2.5 MB
        categoryId: 'doc-cat-1',
        author: 'Sabbath School Department',
        tags: 'bible study,romans,quarterly',
        downloadCount: 145,
        isPublished: true,
        isFeatured: true,
      },
    }),
    db.document.upsert({
      where: { id: 'doc-2' },
      update: {},
      create: {
        id: 'doc-2',
        title: 'Youth Ministry Leadership Manual',
        description: 'A guide for youth leaders on organizing and leading youth programs effectively.',
        fileUrl: '/documents/youth-leadership-manual.pdf',
        fileName: 'youth-leadership-manual.pdf',
        fileType: 'pdf',
        fileSize: 1800000, // 1.8 MB
        categoryId: 'doc-cat-3',
        author: 'Youth Ministry Department',
        tags: 'leadership,youth,ministry,guide',
        downloadCount: 89,
        isPublished: true,
        isFeatured: true,
      },
    }),
    db.document.upsert({
      where: { id: 'doc-3' },
      update: {},
      create: {
        id: 'doc-3',
        title: 'Daily Devotional Calendar 2024',
        description: 'A yearly devotional calendar with daily scripture readings and reflections.',
        fileUrl: '/documents/devotional-calendar-2024.pdf',
        fileName: 'devotional-calendar-2024.pdf',
        fileType: 'pdf',
        fileSize: 950000, // 950 KB
        categoryId: 'doc-cat-4',
        author: 'Spiritual Life Committee',
        tags: 'devotional,calendar,daily readings',
        downloadCount: 234,
        isPublished: true,
        isFeatured: false,
      },
    }),
    db.document.upsert({
      where: { id: 'doc-4' },
      update: {},
      create: {
        id: 'doc-4',
        title: 'Church Membership Application Form',
        description: 'Official application form for church membership.',
        fileUrl: '/documents/membership-application.docx',
        fileName: 'membership-application.docx',
        fileType: 'docx',
        fileSize: 125000, // 125 KB
        categoryId: 'doc-cat-2',
        author: 'Church Administration',
        tags: 'membership,application,form',
        downloadCount: 45,
        isPublished: true,
        isFeatured: false,
      },
    }),
  ]);
  console.log(`Created ${documents.length} documents`);

  // ==================== ARTICLE CATEGORIES ====================
  console.log('Seeding Article Categories...');
  const articleCategories = await Promise.all([
    db.articleCategory.upsert({
      where: { id: 'article-cat-1' },
      update: {},
      create: {
        id: 'article-cat-1',
        name: 'Spiritual Growth',
        description: 'Articles focused on personal spiritual development',
        slug: 'spiritual-growth',
        icon: 'trending-up',
        order: 1,
      },
    }),
    db.articleCategory.upsert({
      where: { id: 'article-cat-2' },
      update: {},
      create: {
        id: 'article-cat-2',
        name: 'Youth Life',
        description: 'Articles addressing topics relevant to young people',
        slug: 'youth-life',
        icon: 'users',
        order: 2,
      },
    }),
    db.articleCategory.upsert({
      where: { id: 'article-cat-3' },
      update: {},
      create: {
        id: 'article-cat-3',
        name: 'Church News',
        description: 'Updates and news from our church community',
        slug: 'church-news',
        icon: 'newspaper',
        order: 3,
      },
    }),
    db.articleCategory.upsert({
      where: { id: 'article-cat-4' },
      update: {},
      create: {
        id: 'article-cat-4',
        name: 'Testimonies',
        description: 'Personal stories of faith and transformation',
        slug: 'testimonies',
        icon: 'heart',
        order: 4,
      },
    }),
  ]);
  console.log(`Created ${articleCategories.length} article categories`);

  // ==================== ARTICLES ====================
  console.log('Seeding Articles...');
  const articles = await Promise.all([
    db.article.upsert({
      where: { id: 'article-1' },
      update: {},
      create: {
        id: 'article-1',
        title: 'Finding Peace in Uncertain Times',
        slug: 'finding-peace-in-uncertain-times',
        excerpt: 'In a world filled with anxiety and uncertainty, how can we find the peace that surpasses all understanding?',
        content: `# Finding Peace in Uncertain Times

In today's fast-paced world, it's easy to feel overwhelmed by the constant stream of news, social media, and personal challenges. As young Christians, we often struggle to balance our faith with the pressures of modern life.

## The Source of True Peace

Jesus said in John 14:27, "Peace I leave with you, My peace I give to you; not as the world gives do I give to you. Let not your heart be troubled, neither let it be afraid."

This peace isn't the absence of trouble—it's the presence of Christ in the midst of trouble. When we anchor ourselves in God's promises, we can experience calm even in the storm.

## Practical Steps to Peace

1. **Start each day with prayer** - Even 5 minutes of quiet time with God can set the tone for your entire day.

2. **Limit media consumption** - Being informed is important, but constant exposure to negative news can steal your peace.

3. **Practice gratitude** - Keep a journal of things you're thankful for. It shifts your focus from problems to blessings.

4. **Stay connected to community** - Surround yourself with believers who can encourage and support you.

5. **Memorize Scripture** - God's Word is a weapon against anxiety. When worry comes, combat it with truth.

## A Prayer for Peace

*Lord, in the midst of life's chaos, help me find my rest in You. Fill me with Your peace that surpasses understanding. Guard my heart and mind through Christ Jesus. Amen.*

Remember, peace is not something we achieve—it's Someone we receive. May you find your peace in Him today.`,
        categoryId: 'article-cat-1',
        author: 'Sarah Williams',
        tags: 'peace,anxiety,faith,spiritual growth',
        readTime: 5,
        viewCount: 234,
        likeCount: 45,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(today.getTime() - 2 * 86400000),
      },
    }),
    db.article.upsert({
      where: { id: 'article-2' },
      update: {},
      create: {
        id: 'article-2',
        title: 'Navigating Social Media as a Young Christian',
        slug: 'navigating-social-media-as-young-christian',
        excerpt: 'How can we use social media wisely while staying true to our faith values?',
        content: `# Navigating Social Media as a Young Christian

Social media has become an integral part of our daily lives. As young Christians, we face unique challenges in using these platforms while maintaining our witness and protecting our spiritual well-being.

## The Double-Edged Sword

Social media can be a powerful tool for:
- Sharing the Gospel
- Connecting with other believers
- Finding encouragement and resources

But it can also lead to:
- Comparison and discontentment
- Time wasted on meaningless content
- Exposure to harmful influences

## Setting Healthy Boundaries

### 1. Time Management
Set specific times for social media use. Consider using apps that track and limit your screen time.

### 2. Content Curation
Be intentional about who you follow. Unfollow accounts that promote negativity, comparison, or values contrary to your faith.

### 3. Think Before You Post
Ask yourself: Would I be comfortable if Jesus saw this post? Is it true, helpful, inspiring, necessary, and kind?

### 4. Use Your Platform for Good
Share your faith journey, encourage others, and be a light in the digital world.

## Digital Discipleship

Remember that your online presence is part of your witness. Let your posts reflect Christ's love and truth. Be authentic about your struggles and victories, always pointing others to the Source of your hope.`,
        categoryId: 'article-cat-2',
        author: 'David Chen',
        tags: 'social media,digital life,witness,youth',
        readTime: 4,
        viewCount: 189,
        likeCount: 32,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date(today.getTime() - 5 * 86400000),
      },
    }),
    db.article.upsert({
      where: { id: 'article-3' },
      update: {},
      create: {
        id: 'article-3',
        title: 'Youth Retreat 2024: A Life-Changing Experience',
        slug: 'youth-retreat-2024-life-changing-experience',
        excerpt: 'Recap of our annual youth retreat with testimonies and highlights from the weekend.',
        content: `# Youth Retreat 2024: A Life-Changing Experience

Our annual youth retreat was nothing short of amazing! Over 50 young people gathered for a weekend of worship, fellowship, and spiritual growth.

## Theme: "Set Apart"

This year's theme focused on what it means to be set apart for God's purposes in a world that constantly pulls us in different directions.

Key takeaways from our sessions:
- **Identity in Christ** - Understanding who we are in Him
- **Purpose** - Discovering God's unique plan for our lives
- **Community** - The importance of godly friendships
- **Service** - Using our gifts to serve others

## Testimonies

> "This retreat changed my perspective on my relationship with God. I've decided to rededicate my life to Him." - Maria, 17

> "I made friendships that I know will last a lifetime. The worship sessions were incredible!" - James, 19

## Looking Ahead

Stay tuned for more events and opportunities to grow together. If you missed this retreat, don't worry—there's always next year!`,
        categoryId: 'article-cat-3',
        author: 'Media Team',
        tags: 'retreat,youth,event,testimony',
        readTime: 3,
        viewCount: 312,
        likeCount: 67,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(today.getTime() - 10 * 86400000),
      },
    }),
  ]);
  console.log(`Created ${articles.length} articles`);

  // ==================== BIBLE STUDIES ====================
  console.log('Seeding Bible Studies...');
  const bibleStudies = await Promise.all([
    db.bibleStudy.upsert({
      where: { id: 'study-1' },
      update: {},
      create: {
        id: 'study-1',
        title: 'Faith in Action: A Study of James',
        description: 'An in-depth look at the practical wisdom found in the Book of James.',
        book: 'James',
        chapters: '1-5',
        difficulty: 'intermediate',
        duration: 45,
        points: 25,
        isPublished: true,
      },
    }),
    db.bibleStudy.upsert({
      where: { id: 'study-2' },
      update: {},
      create: {
        id: 'study-2',
        title: 'The Sermon on the Mount',
        description: 'Exploring Jesus\' revolutionary teachings in Matthew 5-7.',
        book: 'Matthew',
        chapters: '5-7',
        difficulty: 'beginner',
        duration: 60,
        points: 30,
        isPublished: true,
      },
    }),
    db.bibleStudy.upsert({
      where: { id: 'study-3' },
      update: {},
      create: {
        id: 'study-3',
        title: 'Understanding God\'s Grace',
        description: 'A deep dive into the doctrine of grace through the book of Romans.',
        book: 'Romans',
        chapters: '1-8',
        difficulty: 'advanced',
        duration: 90,
        points: 40,
        isPublished: true,
      },
    }),
  ]);
  console.log(`Created ${bibleStudies.length} bible studies`);

  // ==================== STUDY SECTIONS ====================
  console.log('Seeding Study Sections...');
  const studySections = await Promise.all([
    // James study sections
    db.studySection.upsert({
      where: { id: 'section-1' },
      update: {},
      create: {
        id: 'section-1',
        bibleStudyId: 'study-1',
        title: 'Trials and Temptations',
        content: `## Introduction to James

James begins his letter with a counterintuitive statement: "Count it all joy when you fall into various trials." This sets the tone for a letter that challenges our natural responses to life's difficulties.

### Key Points:
1. Trials produce patience
2. Patience leads to maturity
3. Wisdom is available for the asking

### Reflection Questions:
- What trial are you currently facing?
- How might God be using this for your growth?`,
        scriptureRefs: 'James 1:1-18',
        order: 0,
      },
    }),
    db.studySection.upsert({
      where: { id: 'section-2' },
      update: {},
      create: {
        id: 'section-2',
        bibleStudyId: 'study-1',
        title: 'Faith Without Works',
        content: `## The Relationship Between Faith and Works

One of the most debated passages in Scripture, James 2 challenges us to examine the authenticity of our faith.

### Key Points:
1. Faith without works is dead
2. Works are evidence of genuine faith
3. Even demons believe—and tremble

### Reflection Questions:
- How does your faith show itself in your daily life?
- What "works" might God be calling you to?`,
        scriptureRefs: 'James 2:14-26',
        order: 1,
      },
    }),
    // Sermon on the Mount sections
    db.studySection.upsert({
      where: { id: 'section-3' },
      update: {},
      create: {
        id: 'section-3',
        bibleStudyId: 'study-2',
        title: 'The Beatitudes',
        content: `## The Upside-Down Kingdom

Jesus begins His most famous sermon with a series of "blessed are" statements that completely redefine what it means to be successful in God's kingdom.

### The Eight Beatitudes:
1. Blessed are the poor in spirit
2. Blessed are those who mourn
3. Blessed are the meek
4. Blessed are those who hunger for righteousness
5. Blessed are the merciful
6. Blessed are the pure in heart
7. Blessed are the peacemakers
8. Blessed are the persecuted

### Reflection:
Which beatitude speaks most to your current season of life?`,
        scriptureRefs: 'Matthew 5:1-12',
        order: 0,
      },
    }),
  ]);
  console.log(`Created ${studySections.length} study sections`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
