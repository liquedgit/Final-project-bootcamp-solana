use anchor_lang::prelude::*;

pub const TITLE_LENGTH: usize = 32;
pub const CONTENT_LENGTH: usize = 500;
pub const TAG_LENGTH: usize = 10;
pub const COMMENT_LENGTH: usize = 200;
pub const THREAD_SEED: &str = "THREAD_SEED";
pub const COMMENT_SEED: &str = "COMMENT_SEED";
pub const LIKE_SEED: &str = "LIKE_SEED";
pub const THREAD_DISCRIMINATOR: u8 = 1;
pub const COMMENT_DISCRIMINATOR: u8 = 2;
pub const LIKE_DISCRIMINATOR: u8 = 3;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum LikeType {
    Like,
    Celebrate,
    Insightful,
    Love,
    Curious,
    Support,
    Funny,
}

#[account]
pub struct Like {
    pub discriminator: u8,
    pub like_author: Pubkey,
    pub parent: Pubkey,
    pub reaction: LikeType,
    pub bump: u8,
}

#[account]
pub struct Thread {
    pub discriminator: u8,
    pub thread_author: Pubkey,
    pub title: [u8; TITLE_LENGTH],
    pub title_length: u8,
    pub content: [u8; CONTENT_LENGTH],
    pub tags: [[u8; TAG_LENGTH]; TAG_LENGTH],
    pub likes: u64,
    pub bump: u8,
}

#[account]
pub struct Comment {
    pub discriminator: u8,
    pub comment_author: Pubkey,
    pub parent: Pubkey,
    pub comment: [u8; COMMENT_LENGTH],
    pub comment_length: u8,
    pub bump: u8,
}

impl Like {
    pub const LEN: usize = 1 + 32 + 32 + 1 + 1;
}

impl Comment {
    pub const LEN: usize = 1 + 32 + 32 + COMMENT_LENGTH + 1 + 1;
}

impl Thread {
    pub const LEN: usize =
        1 + 32 + TITLE_LENGTH + 1 + CONTENT_LENGTH + (TAG_LENGTH * TAG_LENGTH) + 8 + 1;
}
