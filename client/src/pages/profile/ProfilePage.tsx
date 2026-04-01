import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { formatAbsoluteDateTime } from "../../lib/time";
import { authApi } from "../auth/services/auth-api";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, syncUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    authApi
      .getProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        setNickname(profile.nickname || "");
        setBio(profile.bio || "");
        syncUser(profile);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "获取个人资料失败");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [syncUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const nextUser = await authApi.updateProfile({
        nickname,
        bio,
      });

      syncUser(nextUser);
      setNickname(nextUser.nickname || "");
      setBio(nextUser.bio || "");
      setSuccessMessage("个人资料已更新");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存个人资料失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-surface w-full max-w-2xl">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            个人中心
          </p>
          <h1 className="m-0 text-3xl font-800 text-slate-900">编辑个人资料</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            可以在这里完善昵称和个人简介，事项页顶部也会同步显示最新资料。
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-4 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载个人资料...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-600"
                  htmlFor="profile-username"
                >
                  用户名
                </label>
                <input
                  id="profile-username"
                  value={user?.username || ""}
                  readOnly
                  className="field-base cursor-not-allowed bg-slate-50 text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-600"
                  htmlFor="profile-nickname"
                >
                  昵称
                </label>
                <input
                  id="profile-nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={20}
                  placeholder="给自己起一个更好记的称呼"
                  className="field-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600" htmlFor="profile-bio">
                个人简介
              </label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={120}
                placeholder="可以写下你的关注方向、使用习惯，或一句简单介绍"
                className="field-base min-h-32 resize-y leading-6"
              />
              <p className="text-right text-xs text-slate-400">{bio.length}/120</p>
            </div>

            <div className="grid gap-4 rounded-4 bg-slate-50 px-4 py-4 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                  账号创建时间
                </p>
                <p className="m-0 text-slate-600">
                  {formatAbsoluteDateTime(user?.create_time)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                  最近更新时间
                </p>
                <p className="m-0 text-slate-600">
                  {formatAbsoluteDateTime(user?.update_time)}
                </p>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-4 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-4 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {successMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/todos")}
                className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
              >
                返回事项页
              </button>

              <button type="submit" className="btn-primary px-6" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存个人资料"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
