use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, InitializeAccount, TokenAccount as SPLTokenAccount};

declare_id!("B7c21Tm6YofDVdWThfGvhqrypeRQRELvHPRFFUMCRSyQ");

#[program]
pub mod token_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVaultTokenA>) -> Result<()> {
        Ok(())
    }

    pub fn deposit_to_vault(ctx: Context<DepositToVault>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let state = &mut ctx.accounts.user_vault_state;
        state.owner = ctx.accounts.user.key();
        state.amount = state.amount.checked_add(amount).unwrap();
        
        Ok(())
    }

    pub fn withdraw_from_vault(ctx: Context<WithdrawFromVault>, amountOfToken: u64) -> Result<()> {
        let token_quantity = ctx.accounts.vault_token_account.amount;

        require!(
            amountOfToken <= token_quantity,
            TokenError::InsufficientToken
        );

        let mint_key = ctx.accounts.mint.key();
        
        let seeds = &[
            b"vault_auth",
            mint_key.as_ref(),
            &[ctx.bumps.vault_auth],
        ];

        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_auth.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amountOfToken)?;

        let state = &mut ctx.accounts.user_vault_state;
        state.amount = state.amount.checked_sub(amountOfToken).ok_or(TokenError::UnderflowError)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction()]
pub struct InitializeVaultTokenA<'info> {
    #[account(
        init_if_needed,
        seeds = [b"vaultTokenA", mint.key().as_ref()],
        bump,
        payer = payer,
        token::mint = mint,
        token::authority = vault_auth
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA will be the authority for the vault PDA
    #[account{
        seeds = [b"vault_auth", mint.key().as_ref()],
        bump
    }]
    pub vault_auth: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositToVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vaultTokenA", mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8,
        seeds = [
            b"user_vault",
            user.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub user_vault_state: Account<'info, UserVaultState>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct WithdrawFromVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"user_vault",
            user.key().as_ref(),
            mint.key().as_ref()
            ],
            bump,
    )]

    pub user_vault_state: Account<'info, UserVaultState>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vaultTokenA", mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is just a signer PDA, no data
    #[account(
        seeds = [b"vault_auth", mint.key().as_ref()],
        bump
    )]
    pub vault_auth: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct UserVaultState{
    pub owner: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum TokenError {
    #[msg("Insufficient amount of Token ")]
    InsufficientToken,

    #[msg("Underflow Error")]
    UnderflowError
}
