<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cloud properties are the source of truth for catalogue, featured properties and detail pages; do not fall back to static rows, so removals apply everywhere.
- Enquiries use a validated public server action; private enquiry reads and property writes require database admin-role checks.
- Grant admin only to the configured email after auth email verification, using protected user_roles rather than editable account metadata.
- Property uploads use a private Cloud bucket with public photo signing and short-lived brochure links; do not persist expiring signed URLs.
