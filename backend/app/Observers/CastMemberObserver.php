<?php

namespace App\Observers;

use App\Models\CastMember;
use Bschmitt\Amqp\Message;

class CastMemberObserver
{
    /**
     * Handle the cast member "created" event.
     *
     * @param  \App\Models\CastMember  $castMember
     * @return void
     */
    public function created(CastMember $castMember)
    {
        $message = new Message(
            $castMember->toJson()
        );
        \Amqp::publish('model.cast_member.created', $message);
    }

    /**
     * Handle the cast member "updated" event.
     *
     * @param  \App\Models\CastMember  $castMember
     * @return void
     */
    public function updated(CastMember $castMember)
    {
        $message = new Message(
            $castMember->toJson()
        );
        \Amqp::publish('model.cast_member.updated', $message);
    }

    /**
     * Handle the cast member "deleted" event.
     *
     * @param  \App\Models\CastMember  $castMember
     * @return void
     */
    public function deleted(CastMember $castMember)
    {
        $message = new Message(
            json_encode(['id' => $castMember->id])
        );
        \Amqp::publish('model.cast_member.deleted', $message);
    }

    /**
     * Handle the cast member "restored" event.
     *
     * @param  \App\CastMember  $castMember
     * @return void
     */
    public function restored(CastMember $castMember)
    {
        //
    }

    /**
     * Handle the cast member "force deleted" event.
     *
     * @param  \App\CastMember  $castMember
     * @return void
     */
    public function forceDeleted(CastMember $castMember)
    {
        //
    }
}
