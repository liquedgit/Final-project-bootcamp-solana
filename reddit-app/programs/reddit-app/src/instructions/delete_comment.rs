use anchor_lang::prelude::*;

use crate::states::{Comment, COMMENT_SEED};
pub fn delete_comment(_ctx: Context<DeleteCommentContext>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteCommentContext<'info> {
    #[account(mut)]
    pub comment_authority: Signer<'info>,
    #[account(mut,
        close=comment_authority,
        seeds=[
            comment_authority.key().as_ref(),
            COMMENT_SEED.as_bytes(),
            {anchor_lang::solana_program::hash::hash(comment.comment[..comment.comment_length as usize].as_ref()).to_bytes().as_ref()},
            comment.parent.key().as_ref()
        ],
        bump = comment.bump
    )]
    pub comment: Account<'info, Comment>,
}
