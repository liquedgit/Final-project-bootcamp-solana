use anchor_lang::prelude::*;

use crate::errors::RedditError;
use crate::states::*;

pub fn create_like(ctx: Context<CreateLikeContext>, like_type: LikeType) -> Result<()> {
    let thread = &mut ctx.accounts.thread;
    let like = &mut ctx.accounts.like;
    thread.likes = thread
        .likes
        .checked_add(1)
        .ok_or(RedditError::MaxLikeReached)?;
    like.discriminator = LIKE_DISCRIMINATOR;
    like.like_author = ctx.accounts.like_authority.key();
    like.reaction = like_type;
    like.parent = thread.key();
    like.bump = ctx.bumps.like;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLikeContext<'info> {
    #[account(mut)]
    pub like_authority: Signer<'info>,
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
        init,
        payer = like_authority,
        space = 8 + Like::LEN,
        seeds = [
            LIKE_SEED.as_bytes(),
            like_authority.key().as_ref(),
            thread.key().as_ref()
        ],
        bump
    )]
    pub like: Account<'info, Like>,

    pub system_program: Program<'info, System>,
}
