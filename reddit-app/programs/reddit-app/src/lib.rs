use crate::instructions::*;
use anchor_lang::prelude::*;
pub mod errors;
pub mod instructions;
pub mod states;
pub use states::*;

declare_id!("AQKAEEkfkgQJcNUXyCiKFpwDt4fKKB1X2M5dX8hGNeP5");

#[program]
pub mod reddit_app {
    use states::LikeType;

    use super::*;

    pub fn initialize(
        ctx: Context<InitializeThread>,
        title: String,
        content: String,
        tags: Vec<String>,
    ) -> Result<()> {
        initialize_thread(ctx, title, content, tags)
    }

    pub fn comment_thread(ctx: Context<CreateCommentContext>, content: String) -> Result<()> {
        create_comment(ctx, content)
    }

    pub fn uncomment_thread(ctx: Context<DeleteCommentContext>) -> Result<()> {
        delete_comment(ctx)
    }

    pub fn like_thread(ctx: Context<CreateLikeContext>, like_type: LikeType) -> Result<()> {
        create_like(ctx, like_type)
    }
    pub fn remove_like_thread(ctx: Context<DeleteLikeContext>) -> Result<()> {
        delete_like(ctx)
    }
}
