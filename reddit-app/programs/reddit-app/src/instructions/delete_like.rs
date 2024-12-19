use anchor_lang::prelude::*;

use crate::{errors::RedditError, states::*};

pub fn delete_like(ctx: Context<DeleteLikeContext>) -> Result<()> {
    let thread = &mut ctx.accounts.thread;
    thread.likes = thread
        .likes
        .checked_sub(1)
        .ok_or(RedditError::MaxDislikesReached)?;
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteLikeContext<'info> {
    #[account(mut)]
    pub like_author: Signer<'info>,
    #[account(
        mut,
        seeds = [
            thread.title[..thread.title_length as usize].as_ref(),
            THREAD_SEED.as_bytes(),
            thread.thread_author.key().as_ref()
        ],
        bump = thread.bump
    )]
    pub thread: Account<'info, Thread>,
    #[account(
        mut,
        close=like_author,
        seeds=[
            LIKE_SEED.as_bytes(),
            like_author.key().as_ref(),
            thread.key().as_ref()
        ],
        bump = like.bump
    )]
    pub like: Account<'info, Like>,
}
