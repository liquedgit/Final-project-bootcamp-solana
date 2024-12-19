use anchor_lang::prelude::*;

#[error_code]
pub enum RedditError {
    #[msg("Cannot initialize, title too long")]
    TitleTooLong,
    #[msg("Cannot initialize, content too long")]
    ContentTooLong,
    #[msg("Cannot initialize, too many tag")]
    TagTooMany,
    #[msg("Cannot initialize, tag too long")]
    TagTooLong,
    #[msg("Cannot create comment, comment content too long")]
    CommentContentTooLong,
    #[msg("Cannot like, Max like reached")]
    MaxLikeReached,
    #[msg("Cannot dislike, Max dislikes reached")]
    MaxDislikesReached,
}
