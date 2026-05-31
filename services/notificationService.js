export async function enableNotifications() {
  try {
    if (!window.OneSignalDeferred) {
      return { ok: false, message: "OneSignal غير جاهز" };
    }

    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.Notifications.requestPermission();
    });

    return { ok: true, message: "تم طلب تفعيل الإشعارات" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "فشل تفعيل الإشعارات" };
  }
}
