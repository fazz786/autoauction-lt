"""
fix_bid_statuses
----------------
Run once after switching from auto-approve to manual-approve flow.

For auctions WITH a winner:
  - Keep the winner's highest bid as 'approved'
  - Mark every other bid as 'rejected'

For auctions WITHOUT a winner:
  - Reset all 'approved' bids back to 'pending' so admin can review them
"""
from django.core.management.base import BaseCommand
from apps.auctions.models import Auction
from apps.bids.models import Bid


class Command(BaseCommand):
    help = 'Fix bid statuses for the manual-approve flow'

    def handle(self, *args, **options):
        fixed_auctions = 0

        for auction in Auction.objects.prefetch_related('bids').all():
            # Live/scheduled auctions must never have a winner — clear and reset
            if auction.status in ('live', 'scheduled') and auction.winner_id:
                auction.winner = None
                auction.save(update_fields=['winner'])
                reset = Bid.objects.filter(auction=auction).update(status='pending')
                self.stdout.write(
                    f'  Auction {auction.id} ({auction.listing}) [{auction.status.upper()}]: '
                    f'cleared stale winner, reset {reset} bid(s) to PENDING'
                )
                fixed_auctions += 1

            elif auction.status == 'ended' and auction.winner_id:
                # Ended with winner — keep only that winner's highest bid as approved
                winning_bid = (
                    Bid.objects.filter(auction=auction, bidder_id=auction.winner_id)
                    .order_by('-amount')
                    .first()
                )
                if winning_bid:
                    winning_bid.status = 'approved'
                    winning_bid.save(update_fields=['status'])
                    rejected = Bid.objects.filter(auction=auction).exclude(pk=winning_bid.pk).update(status='rejected')
                    self.stdout.write(
                        f'  Auction {auction.id} ({auction.listing}) [ENDED]: '
                        f'kept bid #{winning_bid.id} as WINNER, rejected {rejected} others'
                    )
                    fixed_auctions += 1

            else:
                # No winner yet — reset any auto-approved bids to pending
                reset = Bid.objects.filter(auction=auction, status='approved').update(status='pending')
                if reset:
                    self.stdout.write(
                        f'  Auction {auction.id} ({auction.listing}): reset {reset} bid(s) to PENDING'
                    )
                    fixed_auctions += 1

        self.stdout.write(self.style.SUCCESS(f'\nDone. Fixed {fixed_auctions} auction(s).'))
