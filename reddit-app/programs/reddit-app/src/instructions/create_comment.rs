use crate::errors::RedditError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn create_comment(ctx: Context<CreateCommentContext>, content: String) -> Result<()> {
    let comment = &mut ctx.accounts.comment;

    require!(content.as_bytes().len() <= COMMENT_LENGTH, RedditError::CommentContentTooLong);
    comment.discriminator = COMMENT_DISCRIMINATOR;
    comment.comment[..content.as_bytes().len()].copy_from_slice(content.as_bytes());
    comment.comment_length = content.as_bytes().len() as u8;
    comment.comment_author = ctx.accounts.comment_authority.key();
    comment.parent = ctx.accounts.thread.key();
    comment.bump = ctx.bumps.comment;
    Ok(())
}
#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct CreateCommentContext<'info> {
    #[account(mut)]
    pub comment_authority: Signer<'info>,
    #[account( 
        init,
        payer = comment_authority,
        space = 8 + Comment::LEN,
        seeds = [
            comment_authority.key().as_ref(),
            COMMENT_SEED.as_bytes(),
            {anchor_lang::solana_program::hash::hash(comment_content.as_bytes()).to_bytes().as_ref()},
            thread.key().as_ref()
        ],
        bump
    )]
    pub comment: Account<'info, Comment>,
    #[account(mut,
        seeds = [
            thread.title[..thread.title_length as usize].as_ref(),
            THREAD_SEED.as_bytes(),
            thread.thread_author.key().as_ref() 
        ],
        bump = thread.bump
    )]
    pub thread: Account<'info, Thread>,
    pub system_program: Program<'info, System>,
}



