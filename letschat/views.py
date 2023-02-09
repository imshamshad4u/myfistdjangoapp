# from msilib.schema import AppId
from django.shortcuts import render
from django.http import JsonResponse

from agora_token_builder import RtcTokenBuilder
import json
from django.views.decorators.csrf import csrf_exempt
import time
import random
from .models import RoomMember
# Create your views here.
def getToken(request):
    appid='34d03177f6cb49d581ae8471b1da54a1'
    appCertificate='3985109f51cf44479febb3f477247b21'
    channelName=request.GET.get('channel')
    uid=random.randint(1,230)
    expirationTimeInSeconds=3600*24
    currentTimeStamp=int(time.time())
    privilegeExpiredTs=currentTimeStamp+expirationTimeInSeconds
    role=1
    token = RtcTokenBuilder.buildTokenWithUid(appid, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)
def home(request):
    return render(request, 'home.html')

def streampage(request):
    return render(request, 'streampage.html')

def room(request,room_name):
    return render(request, 'room.html', {
        'room_name':room_name
    })

@csrf_exempt
def createMember(request):
    data=json.loads(request.body)
    member,created=RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )

    return JsonResponse({'name':data['name']},safe=False)

def getMember(request):
    uid=request.GET.get('UID')
    room_name=request.GET.get('room_name')
    member=RoomMember.objects.get(
        uid=uid,
        room_name=room_name
    )
    name=member.name
    return JsonResponse({'name':member.name},safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member deleted', safe=False)