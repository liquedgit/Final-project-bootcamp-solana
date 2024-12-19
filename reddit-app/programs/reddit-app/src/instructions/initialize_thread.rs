use crate::errors::RedditError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize_thread(
    ctx: Context<InitializeThread>,
    title: String,
    content: String,
    tags: Vec<String>,
) -> Result<()> {
    let initialized_thread = &mut ctx.accounts.thread;
    require!(
        title.as_bytes().len() <= TITLE_LENGTH,
        RedditError::TitleTooLong
    );
    require!(
        content.as_bytes().len() <= CONTENT_LENGTH,
        RedditError::ContentTooLong
    );
    require!(tags.len() <= TAG_LENGTH, RedditError::TagTooMany);
    for (i, tag) in tags.iter().enumerate() {
        require!(tag.as_bytes().len() <= TAG_LENGTH, RedditError::TagTooLong);

        initialized_thread.tags[i][..tag.as_bytes().len()].copy_from_slice(tag.as_bytes());
    }
    initialized_thread.discriminator = THREAD_DISCRIMINATOR;
    initialized_thread.title[..title.as_bytes().len()].copy_from_slice(title.as_bytes());

    initialized_thread.title_length = title.as_bytes().len() as u8;

    initialized_thread.content[..content.as_bytes().len()].copy_from_slice(content.as_bytes());

    initialized_thread.likes = 0;

    initialized_thread.thread_author = ctx.accounts.thread_authority.key();
    initialized_thread.bump = ctx.bumps.thread;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct InitializeThread<'info> {
    #[account(mut)]
    pub thread_authority: Signer<'info>,
    #[account(
        init,
        payer = thread_authority,
        space = 8 + Thread::LEN,
        seeds = [
            title.as_bytes(),
            THREAD_SEED.as_bytes(),
            thread_authority.key().as_ref()
        ],
        bump
    )]
    pub thread: Account<'info, Thread>,
    pub system_program: Program<'info, System>,
}
