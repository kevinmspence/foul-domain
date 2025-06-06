import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAudioPlayer } from '@/components/AudioPlayerContext';

function SortableItem({ entry, onDelete, onPlay, isPlaying }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-white/5 px-4 py-3 rounded mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-white/50 hover:text-white"
          title="Drag to reorder"
        >
          ☰
        </span>
        <div>
          <div className="text-white font-semibold">{entry.song}</div>
          <div className="text-sm text-white/60">
            {entry.venue} — {entry.city}, {entry.state} on{' '}
            {new Date(entry.showdate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-0 flex items-center gap-4">
        <button
          onClick={() => onPlay(entry)}
          className="text-indigo-300 hover:text-indigo-100 text-lg"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        {entry.durationSeconds && (
          <span className="text-sm text-white/50 tabular-nums">
            {Math.floor(entry.durationSeconds / 60)}:
            {(entry.durationSeconds % 60).toString().padStart(2, '0')}
          </span>
        )}
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-400 hover:text-red-200 text-sm"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [playlistName, setPlaylistName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, pause, resume, currentTrack, isPlaying } = useAudioPlayer();

  useEffect(() => {
    if (id && status === 'authenticated') {
      fetch(`/api/playlists/${id}/entries`)
        .then((res) => res.json())
        .then((data) => {
          setPlaylistName(data.name ?? 'Playlist');
          if (Array.isArray(data.entries)) setEntries(data.entries);
          else {
            console.error("Invalid entries data:", data);
            setEntries([]);
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setEntries([]);
        })
        .finally(() => setLoading(false));
    }
  }, [id, status]);

  const handleNameSubmit = async (newName) => {
    if (!newName || newName === playlistName) {
      setEditingName(false);
      return;
    }

    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error('Failed to update playlist name');

      setPlaylistName(newName);
    } catch (err) {
      console.error('Rename failed:', err);
    } finally {
      setEditingName(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(entries, oldIndex, newIndex);
    setEntries(reordered);

    await fetch(`/api/playlists/${id}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reordered: reordered.map((entry, index) => ({
          id: entry.id,
          position: index,
        })),
      }),
    });
  };

  const handleDelete = async (entryId) => {
    if (!confirm('Remove this song from the playlist?')) return;
    await fetch(`/api/playlists/${id}/entries/${entryId}`, {
      method: 'DELETE',
    });
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handlePlay = (entry) => {
    if (!entry.audioUrl) return;
    if (currentTrack?.url === entry.audioUrl) {
      isPlaying ? pause() : resume();
    } else {
      playTrack(
        { title: entry.song, url: entry.audioUrl },
        entries.map((e) => ({ title: e.song, url: e.audioUrl })).filter((e) => !!e.url),
        { venue: entry.venue, showdate: entry.showdate }
      );
    }
  };

  if (status === 'loading' || loading) return null;
  if (status === 'unauthenticated') return <p className="text-white p-4">Please sign in.</p>;

  return (
    <>
      <Head>
        <title>{playlistName}</title>
      </Head>
      <div className="max-w-xl mx-auto p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          {editingName ? (
            <input
              className="bg-white/10 border border-white/20 px-2 py-1 rounded text-white w-full max-w-sm"
              autoFocus
              defaultValue={playlistName}
              onBlur={(e) => handleNameSubmit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNameSubmit(e.target.value);
                } else if (e.key === 'Escape') {
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold">{playlistName}</h1>
              <button
                onClick={() => setEditingName(true)}
                className="text-white/60 hover:text-white text-sm"
                title="Rename playlist"
              >
                ✏️
              </button>
            </>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-white/60">No songs in this playlist.</p>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <ul>
                {entries.map((entry) => (
                  <SortableItem
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onPlay={handlePlay}
                    isPlaying={currentTrack?.url === entry.audioUrl && isPlaying}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  );
}
