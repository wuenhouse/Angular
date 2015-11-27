from django.conf.urls import patterns, include, url
#from login import views
from . import views
from . import dashboard

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^main$', views.main, name='main'),
    url(r'^shop/(.*)/$', dashboard.getinfo, name='shop'),
    url(r'^shopls/$', dashboard.getclient, name='shopls'),
    url(r'^src/(.*)$', dashboard.getsrc, name='src'),
    url(r'^logs/(.*)/(.*)/(.*)/$',dashboard.getlog, name='log'),
    url(r'^all/(.*)/$',dashboard.getall, name='all'),
    url(r'^infos/(.*)/(.*)/$',dashboard.getloginfos, name='infos'),
    url(r'^tasks/(.*)/$', dashboard.gettask, name='tasks'),
    url(r'^monitor/$', dashboard.getclients, name='clients'),
    #url(r'^demo/$', views.demo, name='demo'),
]
